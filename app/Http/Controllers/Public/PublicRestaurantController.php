<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Restaurant;
use App\Support\LocaleResolver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicRestaurantController extends Controller
{
    public function show(Request $request, Restaurant $restaurant): Response
    {
        $restaurant->load(['translations']);

        $locale = LocaleResolver::resolve($request, $restaurant->availableLocales());
        $translation = $restaurant->translation($locale);

        $menus = $restaurant->menus()
            ->with('categories.items')
            ->get();

        return Inertia::render('Public/Restaurant', [
            'locale' => $locale,
            // Content and interface languages are resolved separately: the copy
            // below falls back to a language the restaurant has, while the
            // surrounding interface keeps the direction the visitor asked for.
            'ui_locale' => app()->getLocale(),
            'languages' => $restaurant->availableLocales(),
            // The profile page wears the look of the restaurant's first menu,
            // so the branding a guest sees is the branding they scanned for.
            'theme' => ($menus->first() ?? new Menu)->theme(),
            'restaurant' => [
                'slug' => $restaurant->slug,
                'name' => $translation->name,
                'description' => $translation->description,
                'banner' => $restaurant->banner !== null ? custom_asset('storage/'.$restaurant->banner) : null,
                'logo' => $restaurant->logo !== null ? custom_asset('storage/'.$restaurant->logo) : null,
                'address' => $restaurant->address,
                'latitude' => $restaurant->latitude,
                'longitude' => $restaurant->longitude,
                'maps_url' => $restaurant->maps_url
                    ?? ($restaurant->latitude !== null && $restaurant->longitude !== null
                        ? sprintf('https://www.google.com/maps?q=%s,%s', (float) $restaurant->latitude, (float) $restaurant->longitude)
                        : null),
                'social_links' => $restaurant->social_links ?? [],
            ],
            'menus' => $menus
                ->map(fn ($menu) => [
                    'slug' => $menu->slug,
                    'name' => $menu->name,
                    'currency' => $menu->currency,
                    'items_count' => $menu->categories->sum(fn ($category) => $category->items->count()),
                    'url' => route('public.menu', $menu->slug),
                ])->values(),
        ]);
    }
}
