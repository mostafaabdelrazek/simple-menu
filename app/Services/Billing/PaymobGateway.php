<?php

namespace App\Services\Billing;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Paymob Accept gateway.
 *
 * Checkout follows the hosted-iframe flow: authenticate → create the order →
 * request a payment key → send the customer to the iframe URL. Activation
 * happens when Paymob's "transaction created" webhook arrives, verified with
 * the HMAC secret shared between the dashboard and this application.
 */
class PaymobGateway
{
    /**
     * Create the Paymob order + payment key for the plan and return the
     * hosted iframe URL to redirect the customer to.
     *
     * @param  array<string, mixed>  $plan  config('billing.plans.pro')
     */
    public static function checkout(User $user, array $plan): string
    {
        $config = (array) config('billing.paymob');
        $currency = BillingManager::currency();
        $amountCents = (int) round(((float) $plan['price']) * 100);

        $subscription = BillingManager::startSubscription($user, (string) $plan['slug'], 'paymob');

        $authToken = Http::baseUrl($config['base_url'])
            ->post('/auth/tokens', ['api_key' => $config['api_key']])
            ->throw()
            ->json('token');

        $order = Http::baseUrl($config['base_url'])
            ->post('/ecommerce/orders', [
                'auth_token' => $authToken,
                'delivery_needed' => false,
                'amount_cents' => $amountCents,
                'currency' => $currency,
                'merchant_order_id' => $subscription->gateway_order_id,
                'items' => [[
                    'name' => $plan['name'].' plan',
                    'amount_cents' => $amountCents,
                    'quantity' => 1,
                ]],
            ])->throw()->json();

        $paymentKey = Http::baseUrl($config['base_url'])
            ->post('/acceptance/payment_keys', [
                'auth_token' => $authToken,
                'amount_cents' => $amountCents,
                'currency' => $currency,
                'order_id' => $order['id'],
                'integration_id' => (int) $config['integration_id'],
                'billing_data' => [
                    'first_name' => $user->name,
                    'last_name' => $user->name,
                    'email' => $user->email,
                    'phone_number' => (string) ($user->phone ?? '00000000'),
                    'country' => 'EG',
                    'city' => 'NA',
                    'street' => 'NA',
                    'building' => 'NA',
                    'floor' => 'NA',
                    'apartment' => 'NA',
                    'state' => 'NA',
                    'postal_code' => 'NA',
                ],
            ])->throw()->json('token');

        return rtrim((string) $config['base_url'], '/').'/acceptance/iframes/'.$config['iframe_id'].'?payment_token='.$paymentKey;
    }

    /**
     * Verify a Paymob "transaction created" webhook against the shared HMAC
     * secret (the digest Paymob sends in `hmac`).
     *
     * @param  array<string, mixed>  $data  the `obj` transaction payload
     */
    public static function verifyHmac(array $data, ?string $provided): bool
    {
        $secret = (string) config('billing.paymob.hmac_secret', '');

        if ($secret === '' || $provided === null || $provided === '') {
            return false;
        }

        return hash_equals(self::signedDigest($data, $secret), $provided);
    }

    /**
     * The ordered concatenation of response fields Paymob defines for the
     * transaction callback, signed with HMAC-SHA512.
     *
     * @param  array<string, mixed>  $transaction
     */
    public static function signedDigest(array $transaction, string $secret): string
    {
        $keys = [
            'amount_cents',
            'created_at',
            'currency',
            'error_occured',
            'is_auth',
            'is_capture',
            'is_refunded',
            'is_standalone_payment',
            'is_3d_secure_authentication',
            'merchant_order_id',
            'order_id',
            'parent_transaction_id',
            'pending',
            'source_data.pan',
            'source_data.sub_type',
            'source_data.type',
            'success',
        ];

        $concatenated = '';

        foreach ($keys as $key) {
            $value = data_get($transaction, $key);

            $concatenated .= match (true) {
                $value === null => '',
                is_bool($value) => $value ? 'true' : 'false',
                default => (string) $value,
            };
        }

        return hash_hmac('sha512', $concatenated, $secret);
    }

    /**
     * Apply a verified Paymob transaction: a successful payment activates or
     * extends the subscription that owns the merchant order id. Failed
     * transactions are logged only — the customer retries from the pricing
     * page.
     *
     * @param  array<string, mixed>  $transaction
     */
    public static function handleTransaction(array $transaction, bool $success): void
    {
        $merchantOrderId = (string) ($transaction['merchant_order_id'] ?? '');

        $subscription = Subscription::query()
            ->where('gateway', 'paymob')
            ->where('gateway_order_id', $merchantOrderId)
            ->first();

        if ($subscription === null) {
            Log::warning('Paymob webhook for an unknown merchant order.', ['merchant_order_id' => $merchantOrderId]);

            return;
        }

        // A manually canceled subscription must not be reactivated by a
        // delayed or duplicate webhook.
        if ($subscription->canceled_at !== null) {
            Log::info('Paymob webhook for a manually canceled subscription, ignoring.', [
                'merchant_order_id' => $merchantOrderId,
            ]);

            return;
        }

        if ($success) {
            $subscription->forceFill([
                'gateway_transaction_id' => (string) ($transaction['id'] ?? ''),
            ])->save();

            BillingManager::activateForMonth($subscription);

            return;
        }

        Log::info('Paymob transaction reported failure.', [
            'merchant_order_id' => $merchantOrderId,
            'error_message' => $transaction['error_message'] ?? null,
        ]);
    }
}
