<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\BillingManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $subscriptions = Subscription::query()
            ->with('user')
            ->when($request->string('search')->toString(), fn ($query, $search) => $query
                ->whereHas('user', fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")))
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Subscription $subscription) => [
                'id' => $subscription->id,
                'plan' => $subscription->plan,
                'status' => $subscription->status,
                'is_active' => $subscription->isActive(),
                'is_trial' => $subscription->isOnTrial(),
                'gateway' => $subscription->gateway,
                'gateway_order_id' => $subscription->gateway_order_id,
                'user' => $subscription->user?->only('id', 'name', 'email'),
                'current_period_end' => $subscription->current_period_end?->toDateString(),
                'trial_ends_at' => $subscription->trial_ends_at?->toDateString(),
                'created_at' => $subscription->created_at?->toDateString(),
                'cancel_url' => route('admin.subscriptions.cancel', $subscription),
            ]);

        return Inertia::render('Admin/Subscriptions', [
            'subscriptions' => $subscriptions,
            'plans' => BillingManager::publicPlans(),
        ]);
    }

    /**
     * Grant a paid plan to a user by hand — used to comp accounts when no
     * gateway is configured (or when support fixes billing issues).
     */
    public function grant(Request $request): RedirectResponse
    {
        $this->authorizeAdmin();

        $data = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            // The free plan is the default — it cannot be granted.
            'plan' => ['required', 'string', 'in:'.implode(',', array_diff(array_keys(BillingManager::plans()), ['free']))],
            'months' => ['nullable', 'integer', 'min:1', 'max:24'],
        ]);

        $subscription = BillingManager::startSubscription(
            User::query()->where('email', $data['email'])->firstOrFail(),
            $data['plan'],
            'manual'
        );

        $subscription->forceFill([
            'status' => Subscription::STATUS_ACTIVE,
            'current_period_start' => now(),
            'current_period_end' => now()->addMonths((int) ($data['months'] ?? 1)),
            'trial_ends_at' => null,
            'gateway_order_id' => 'manual-'.$subscription->id,
        ])->save();

        return back()->with('success', __('admin.subscriptions.granted'));
    }

    public function cancel(Subscription $subscription): RedirectResponse
    {
        $this->authorizeAdmin();

        $subscription->markCanceled();

        return back()->with('success', __('admin.subscriptions.canceled'));
    }
}
