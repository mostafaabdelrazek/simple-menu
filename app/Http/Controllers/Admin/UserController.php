<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Billing\BillingManager;
use App\Support\PublicPageCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->withCount('restaurants')
            ->when($request->string('search')->toString(), fn ($query, $search) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'plan' => BillingManager::currentPlanSlug($user),
                'restaurants_count' => $user->restaurants_count,
                'suspended' => $user->isSuspended(),
                'created_at' => $user->created_at?->toDateString(),
            ]);

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    /**
     * Suspending a user hides all of their restaurants from the public pages
     * and blocks the account until an admin restores it.
     */
    public function suspend(User $user): RedirectResponse
    {
        $this->authorizeAdmin();

        $user->forceFill(['suspended_at' => now()])->save();

        $user->restaurants()->pluck('id')->each(
            fn (int $restaurantId) => PublicPageCache::forgetRestaurantWithMenus($restaurantId)
        );

        return back()->with('success', __('admin.moderation.stopped'));
    }

    public function restore(User $user): RedirectResponse
    {
        $this->authorizeAdmin();

        $user->forceFill(['suspended_at' => null])->save();

        $user->restaurants()->pluck('id')->each(
            fn (int $restaurantId) => PublicPageCache::forgetRestaurantWithMenus($restaurantId)
        );

        return back()->with('success', __('admin.moderation.restored'));
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorizeAdmin();

        // Prevent an admin from deleting themselves.
        abort_if(auth('admin')->id() === $user->id, 403, 'You cannot delete your own account.');

        $user->restaurants()->pluck('id')->each(
            fn (int $restaurantId) => PublicPageCache::forgetRestaurantWithMenus($restaurantId)
        );

        $user->delete();

        return back()->with('success', __('admin.moderation.deleted'));
    }
}
