<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Restaurant;
use App\Services\Billing\BillingManager;
use App\Support\LocaleResolver;
use App\Support\PublicPageCache;
use App\Support\Seo;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicRestaurantController extends Controller
{
    public function show(Request $request, Restaurant $restaurant): Response|RedirectResponse
    {
        if ($restaurant->isSuspended() || $restaurant->owner?->isSuspended()) {
            return redirect()->route('suspended');
        }

        // If the restaurant's owner is over their plan limit (downgraded /
        // canceled), the public page is unavailable until they upgrade.
        if ($restaurant->owner && BillingManager::isOverRestaurantLimit($restaurant->owner)) {
            return redirect()->route('billing')->with('error', __('billing.restaurant_limit_reached'));
        }

        $locale = LocaleResolver::resolve($request, $restaurant->availableLocales());

        $props = PublicPageCache::rememberRestaurant($restaurant, $locale, function () use ($restaurant, $locale) {
            $restaurant->load(['translations']);

            $translation = $restaurant->translation($locale);

            abort_if($translation === null, 404, 'Restaurant is not available in the requested language.');

            $menus = $restaurant->menus()
                ->with('categories.items')
                ->get();

            return [
                'locale' => $locale,
                // Content and interface languages are resolved separately: the copy
                // below falls back to a language the restaurant has, while the
                // surrounding interface keeps the direction the visitor asked for.
                'languages' => $restaurant->availableLocales(),
                // The profile page wears the look of the restaurant's first menu,
                // so the branding a guest sees is the branding they scanned for.
                'theme' => $menus->isNotEmpty() ? $menus->first()->theme() : Menu::DEFAULT_THEME,
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
                // Media + copy the Blade shell uses for Open Graph/structured data.
                'seo' => [
                    'image' => $restaurant->banner !== null
                        ? custom_asset('storage/'.$restaurant->banner)
                        : ($restaurant->logo !== null ? custom_asset('storage/'.$restaurant->logo) : null),
                ],
            ];
        });

        $props['ui_locale'] = app()->getLocale();
        $props['branding'] = BillingManager::showsBranding($restaurant->owner);

        $description = $props['restaurant']['description']
            ?? __('seo.restaurant_description', ['restaurant' => $props['restaurant']['name']]);

        Seo::share($request, $props['restaurant']['name'], $description, [
            'image' => $props['seo']['image'],
            'type' => 'restaurant',
            'jsonld' => [$this->restaurantSchema($restaurant, $props)],
        ]);

        return Inertia::render('Public/Restaurant', $props);
    }

    /**
     * Structured data so search engines see the business even though the
     * page itself is a client-rendered SPA.
     */
    private function restaurantSchema(Restaurant $restaurant, array $props): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Restaurant',
            'name' => $props['restaurant']['name'],
            'url' => url('/r/'.$restaurant->slug),
            'image' => array_values(array_filter([$props['restaurant']['banner'], $props['restaurant']['logo']])),
            'address' => $props['restaurant']['address'],
            'geo' => $props['restaurant']['latitude'] !== null ? [
                '@type' => 'GeoCoordinates',
                'latitude' => (float) $props['restaurant']['latitude'],
                'longitude' => (float) $props['restaurant']['longitude'],
            ] : null,
            'social_media' => array_values(array_map(
                fn ($link) => $link['url'] ?? null,
                $props['restaurant']['social_links']
            )),
        ];
    }
}
