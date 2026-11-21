<?php

namespace App\Services\Billing;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Glue between the account (User) and the plan configuration: resolves the
 * plan a user is on, its limits, and what a plan allows on the public pages.
 */
class BillingManager
{
    /**
     * Every configured plan, keyed by slug.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function plans(): array
    {
        return config('billing.plans', []);
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function plan(string $slug): ?array
    {
        $plan = self::plans()[$slug] ?? null;

        if ($plan !== null) {
            $plan['slug'] = $slug;
        }

        return $plan;
    }

    public static function currency(): string
    {
        return (string) config('billing.currency', 'EGP');
    }

    /**
     * The plan slug the user effectively benefits from, or the default plan.
     * The newest active subscription wins; expired or canceled ones are
     * ignored (keeping the plan retains its config after the period lapses).
     */
    public static function currentPlanSlug(User $user): string
    {
        $subscription = self::activeSubscription($user);

        if ($subscription === null) {
            return (string) config('billing.default_plan', 'free');
        }

        return $subscription->plan;
    }

    public static function currentPlan(User $user): array
    {
        return self::plan(self::currentPlanSlug($user))
            ?? self::plan((string) config('billing.default_plan', 'free'))
            ?? [
                'name' => 'Free',
                'limits' => ['restaurants' => 1, 'items_per_menu' => 20],
                'features' => ['branding' => true],
            ];
    }

    /**
     * Maximum restaurants on the user's plan, or null for unlimited.
     */
    public static function restaurantLimit(User $user): ?int
    {
        return self::currentPlan($user)['limits']['restaurants'] ?? null;
    }

    /**
     * Maximum items in one menu on the user's plan, or null for unlimited.
     */
    public static function itemLimit(User $user): ?int
    {
        return self::currentPlan($user)['limits']['items_per_menu'] ?? null;
    }

    public static function restaurantsLeft(User $user): ?int
    {
        $limit = self::restaurantLimit($user);

        if ($limit === null) {
            return null;
        }

        return max(0, $limit - (int) $user->restaurants()->count());
    }

    /**
     * Whether the plan shows the SimpleMenu branding on public pages.
     */
    public static function showsBranding(User $user): bool
    {
        return (bool) (self::currentPlan($user)['features']['branding'] ?? true);
    }

    /**
     * Whether the user has more restaurants than their plan allows.
     */
    public static function isOverRestaurantLimit(User $user): bool
    {
        $limit = self::restaurantLimit($user);

        if ($limit === null) {
            return false;
        }

        return $user->restaurants()->count() > $limit;
    }

    /**
     * Whether the user has more items in a menu than their plan allows.
     *
     * @param  array<int, array<string, mixed>>  $categories
     */
    public static function isOverItemLimit(User $user, array $categories): bool
    {
        $limit = self::itemLimit($user);

        if ($limit === null) {
            return false;
        }

        return self::countItems($categories) > $limit;
    }

    /**
     * How many items the posted payload counts up to.
     *
     * @param  array<int, array<string, mixed>>  $categories
     */
    public static function countItems(array $categories): int
    {
        return array_sum(array_map(
            fn (array $category) => count($category['items'] ?? []),
            $categories
        ));
    }

    /**
     * The active subscription driving the user's plan, if any.
     */
    public static function activeSubscription(User $user): ?Subscription
    {
        if (! $user->relationLoaded('subscriptions')) {
            $user->loadMissing('subscriptions');
        }

        return $user->subscriptions
            ->first(fn (Subscription $subscription) => $subscription->isActive());
    }

    /**
     * The plan configuration shaped for the frontend (no internal keys).
     *
     * @return array<string, mixed>
     */
    public static function publicPlan(string $slug): array
    {
        $plan = self::plan($slug) ?? [];

        return [
            'slug' => $slug,
            'name' => $plan['name'] ?? $slug,
            'currency' => self::currency(),
            'price' => $plan['price'] ?? 0,
            'billing_period' => $plan['billing_period'] ?? null,
            'limits' => $plan['limits'] ?? [],
            'features' => $plan['features'] ?? [],
            'highlights' => array_values((array) ($plan['highlights'] ?? [])),
        ];
    }

    /**
     * All plans, shaped for the frontend.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function publicPlans(): array
    {
        return collect(self::plans())
            ->map(fn (array $_, string $slug) => self::publicPlan($slug))
            ->values()->all();
    }

    /**
     * Start a checkout for the given plan.
     *
     * Returns the gateway redirect URL, or null when no gateway is
     * configured — in that case the caller gives the user a trial instead so
     * the product still works without payment credentials.
     *
     * @param  array<string, mixed>  $plan
     */
    public static function startCheckout(User $user, array $plan): ?string
    {
        $gateway = (string) config('billing.driver', 'none');

        if ($gateway === 'paymob') {
            return PaymobGateway::checkout($user, $plan);
        }

        return null;
    }

    /**
     * Create (or reuse) the subscription row a gateway / trial belongs to.
     */
    public static function startSubscription(User $user, string $plan, string $gateway): Subscription
    {
        // Replace any previous pending subscription for this user so repeated
        // checkout attempts don't leave a trail of stale gateway orders.
        Subscription::query()
            ->where('user_id', $user->id)
            ->where('status', Subscription::STATUS_PENDING)
            ->delete();

        return Subscription::query()->create([
            'user_id' => $user->id,
            'plan' => $plan,
            'status' => Subscription::STATUS_PENDING,
            'gateway' => $gateway,
            'gateway_order_id' => 'sm-'.$user->id.'-'.mb_strtolower(Str::random(10)),
        ]);
    }

    /**
     * Renew / activate a subscription for the Paymob billing cycle (monthly).
     */
    public static function activateForMonth(Subscription $subscription): void
    {
        $from = $subscription->current_period_end && $subscription->current_period_end->isFuture()
            ? Carbon::parse($subscription->current_period_end)
            : now();

        $subscription->forceFill([
            'status' => Subscription::STATUS_ACTIVE,
            'trial_ends_at' => null,
            'canceled_at' => null,
            'current_period_start' => $subscription->current_period_start ?? now(),
            'current_period_end' => $from->copy()->addMonth(),
        ])->save();
    }
}
