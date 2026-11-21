<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Menu;
use App\Models\Restaurant;
use App\Models\Subscription;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'admins' => Admin::count(),
                'users' => User::count(),
                'suspended_users' => User::query()->whereNotNull('suspended_at')->count(),
                'restaurants' => Restaurant::count(),
                'suspended_restaurants' => Restaurant::query()->whereNotNull('suspended_at')->count(),
                'menus' => Menu::count(),
                'subscriptions' => [
                    // Counted fresh from the DB rather than looping over
                    // users, so stays correct when owners hold several
                    // subscription rows over their lifetime.
                    'active' => Subscription::query()
                        ->where('status', Subscription::STATUS_ACTIVE)
                        ->where(function ($query) {
                            $query->whereNull('current_period_end')
                                ->orWhere('current_period_end', '>', now());
                        })->count(),
                    'trials' => Subscription::query()
                        ->where('status', Subscription::STATUS_TRIAL)
                        ->where('trial_ends_at', '>', now())
                        ->count(),
                ],
            ],
        ]);
    }
}
