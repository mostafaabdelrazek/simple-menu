<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\BillingManager;
use App\Services\Billing\PaymobGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    /**
     * Public pricing page: every plan and its limits, no account required.
     */
    public function pricing(): Response
    {
        $user = Auth::guard('web')->user();

        return Inertia::render('Pricing', [
            'plans' => BillingManager::publicPlans(),
            'current_plan' => $user !== null ? BillingManager::currentPlanSlug($user) : null,
            // Signed-in visitors upgrade from here; visitors without an
            // account are sent to sign in first.
            'cta_url' => $user !== null ? $user->restaurants()->exists() ? route('dashboard') : route('restaurants.create') : route('login'),
        ]);
    }

    /**
     * The signed-in account's plan, usage and upgrade options.
     */
    public function index(): Response
    {
        /** @var User $user */
        $user = Auth::guard('web')->user();

        $active = BillingManager::activeSubscription($user);

        return Inertia::render('Billing/Index', [
            'plan' => BillingManager::currentPlanSlug($user),
            'restaurants_used' => (int) $user->restaurants()->count(),
            'restaurants_limit' => BillingManager::restaurantLimit($user),
            'items_limit' => BillingManager::itemLimit($user),
            'subscription' => $active !== null ? [
                'plan' => $active->plan,
                'status' => $active->status,
                'is_trial' => $active->isOnTrial(),
                'current_period_end' => $active->current_period_end?->toDateString(),
                'trial_ends_at' => $active->trial_ends_at?->toDateString(),
                'canceled_at' => $active->canceled_at?->toDateString(),
            ] : null,
            'gateway_enabled' => (string) config('billing.driver', 'none') !== 'none',
            'currency' => BillingManager::currency(),
            'plans' => BillingManager::publicPlans(),
        ]);
    }

    /**
     * Start an upgrade to the posted plan.
     */
    public function checkout(Request $request): RedirectResponse|\Inertia\Response
    {
        $planSlug = (string) $request->validate(['plan' => ['required', 'string']])['plan'];
        $plan = BillingManager::plan($planSlug);

        if ($plan === null || $planSlug === (string) config('billing.default_plan')) {
            return back()->with('error', __('billing.unknown_plan'));
        }

        /** @var User $user */
        $user = Auth::guard('web')->user();

        if (BillingManager::currentPlanSlug($user) === $planSlug && BillingManager::activeSubscription($user) !== null) {
            return back()->with('error', __('billing.already_subscribed'));
        }

        if ((string) config('billing.driver', 'none') !== 'none') {
            // External (Paymob) redirects must be issued as a full-page
            // visit: an Inertia XHR 302 would be followed by the browser and
            // blocked by Paymob's CORS policy on the XSRF token header.
            return Inertia::location(BillingManager::startCheckout($user, $plan));
        }

        // No gateway configured (local / staging): put the account on a trial
        // of the paid plan so the limits can be exercised end to end.
        $subscription = BillingManager::startSubscription($user, $planSlug, 'trial');
        $subscription->forceFill([
            'status' => Subscription::STATUS_TRIAL,
            'trial_ends_at' => now()->addDays((int) config('billing.trial_days', 14)),
        ])->save();

        return redirect()->route('billing')
            ->with('success', __('billing.trial_granted', ['days' => (int) config('billing.trial_days', 14)]));
    }

    /**
     * Cancel the user's own active subscription. Reverts them to the free
     * plan at the end of the current period (or immediately if on trial).
     */
    public function cancel(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::guard('web')->user();

        $active = BillingManager::activeSubscription($user);

        if ($active === null) {
            return back()->with('error', __('billing.no_active_subscription'));
        }

        // Only the subscription owner can cancel it.
        abort_if($active->user_id !== $user->id, 403);

        $active->markCanceled();

        return back()->with('success', __('billing.subscription_canceled'));
    }

    /**
     * Paymob's "transaction created" callback, HMAC-verified.
     */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $transaction = (array) ($payload['obj'] ?? []);

        if (! PaymobGateway::verifyHmac($transaction, $payload['hmac'] ?? null)) {
            return response()->json(['message' => __('billing.webhook_invalid')], 403);
        }

        PaymobGateway::handleTransaction(
            $transaction,
            filter_var($transaction['success'] ?? false, FILTER_VALIDATE_BOOLEAN)
        );

        return response()->json(['message' => 'OK']);
    }
}
