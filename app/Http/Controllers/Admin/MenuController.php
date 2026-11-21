<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Support\PublicPageCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(Request $request): Response
    {
        $menus = Menu::query()
            ->with('restaurant.translations')
            ->when($request->string('search')->toString(), fn ($query, $search) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhereHas('restaurant.translations', fn ($q) => $q->where('name', 'like', "%{$search}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Menu $menu) => [
                'id' => $menu->id,
                'slug' => $menu->slug,
                'name' => $menu->name ?: $menu->restaurant->translation()->name,
                'restaurant' => $menu->restaurant->translation()->name,
                'suspended' => $menu->restaurant->isSuspended(),
                'currency' => $menu->currency,
                'languages' => $menu->languages,
                'created_at' => $menu->created_at->toDateTimeString(),
                'url' => route('public.menu', $menu->slug),
            ]);

        return Inertia::render('Admin/Menus', [
            'menus' => $menus,
        ]);
    }

    public function destroy(Menu $menu): RedirectResponse
    {
        $this->authorizeAdmin();

        PublicPageCache::forgetMenu($menu);
        PublicPageCache::forgetRestaurant($menu->restaurant);

        $menu->delete();

        return back()->with('success', __('admin.moderation.deleted'));
    }
}
