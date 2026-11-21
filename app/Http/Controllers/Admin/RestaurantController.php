<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Services\Billing\BillingManager;
use App\Support\PublicPageCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantController extends Controller
{
    public function index(Request $request): Response
    {
        $restaurants = Restaurant::query()
            ->with(['translations', 'owner'])
            ->when($request->string('search')->toString(), fn ($query, $search) => $query
                ->whereHas('translations', fn ($q) => $q->where('name', 'like', "%{$search}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Restaurant $restaurant) => [
                'id' => $restaurant->id,
                'slug' => $restaurant->slug,
                'name' => $restaurant->translation()?->name,
                'owner' => $restaurant->owner?->name,
                'suspended' => $restaurant->isSuspended(),
                'owner_plan' => $restaurant->owner !== null ? BillingManager::currentPlanSlug($restaurant->owner) : null,
                'created_at' => $restaurant->created_at?->toDateTimeString(),
                'url' => route('public.restaurant', $restaurant->slug),
            ]);

        return Inertia::render('Admin/Restaurants', [
            'restaurants' => $restaurants,
        ]);
    }

    public function suspend(Restaurant $restaurant): RedirectResponse
    {
        $this->authorizeAdmin();

        $restaurant->forceFill(['suspended_at' => now()])->save();

        PublicPageCache::forgetRestaurantWithMenus($restaurant);

        return back()->with('success', __('admin.moderation.suspended'));
    }

    public function restore(Restaurant $restaurant): RedirectResponse
    {
        $this->authorizeAdmin();

        $restaurant->forceFill(['suspended_at' => null])->save();

        PublicPageCache::forgetRestaurantWithMenus($restaurant);

        return back()->with('success', __('admin.moderation.restored'));
    }

    public function destroy(Restaurant $restaurant): RedirectResponse
    {
        $this->authorizeAdmin();

        PublicPageCache::forgetRestaurantWithMenus($restaurant);

        $restaurant->delete();

        return back()->with('success', __('admin.moderation.deleted'));
    }
}
