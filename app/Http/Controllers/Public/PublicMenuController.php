<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Services\Billing\BillingManager;
use App\Support\LocaleResolver;
use App\Support\PublicPageCache;
use App\Support\Seo;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicMenuController extends Controller
{
    public function show(Request $request, Menu $menu): Response|RedirectResponse
    {
        // Suspended restaurants never serve their menus; the owner is guided
        // to the notice page while the moderation issue is resolved.
        if ($menu->restaurant->isSuspended() || $menu->restaurant->owner?->isSuspended()) {
            return redirect()->route('suspended');
        }

        // If the restaurant's owner is over their plan limit, the menu is
        // unavailable until they upgrade.
        if ($menu->restaurant->owner && BillingManager::isOverRestaurantLimit($menu->restaurant->owner)) {
            return redirect()->route('billing')->with('error', __('billing.restaurant_limit_reached'));
        }

        $locale = LocaleResolver::resolve($request, $menu->languages);

        $props = PublicPageCache::rememberMenu($menu, $locale, function () use ($menu, $locale) {
            $menu->load(['restaurant.translations', 'categories.items.translations', 'categories.translations']);

            $restaurantTranslation = $menu->restaurant->translation($locale);

            abort_if($restaurantTranslation === null, 404, 'Menu is not available in the requested language.');

            $categories = $menu->categories
                ->filter(fn ($category) => $category->translation($locale) !== null)
                ->map(function ($category) use ($locale) {
                    return [
                        'name' => optional($category->translation($locale))->name,
                        'items' => $category->items->map(function ($item) use ($locale) {
                            $translation = $item->translation($locale);

                            return [
                                'name' => optional($translation)->name,
                                'description' => optional($translation)->description,
                                'price' => $item->price,
                                'discount_price' => $item->discount_price,
                                'image' => $item->image !== null ? custom_asset('storage/'.$item->image) : null,
                            ];
                        })->values(),
                    ];
                })->values();

            return [
                'locale' => $locale,
                // The menu content falls back to a language it actually has, but the
                // interface around it follows the visitor's own language so a
                // French reader never gets a right-to-left French page.
                'languages' => $menu->languages,
                'theme' => $menu->theme(),
                'restaurant' => [
                    'name' => $restaurantTranslation->name,
                    'url' => route('public.restaurant', $menu->restaurant->slug),
                ],
                'menu' => [
                    'name' => $menu->name,
                    'currency' => $menu->currency,
                    'categories' => $categories,
                ],
                // Media + copy the Blade shell uses for Open Graph/structured data.
                'seo' => [
                    'description' => $restaurantTranslation->description,
                    'image' => $menu->restaurant->logo !== null ? custom_asset('storage/'.$menu->restaurant->logo) : null,
                ],
            ];
        });

        if (filled($props['restaurant']['name']) && blank($props['seo']['description'])) {
            $props['seo']['description'] = __('seo.menu_description', ['restaurant' => $props['restaurant']['name']]);
        }

        // These depend on the request / billing state rather than the entity,
        // so they are layered on after the cached props.
        $props['ui_locale'] = app()->getLocale();
        $props['branding'] = BillingManager::showsBranding($menu->restaurant->owner);

        Seo::share($request, $props['restaurant']['name'].' · '.$menu->name, $props['seo']['description'], [
            'image' => $props['seo']['image'],
            'type' => 'website',
            'jsonld' => [$this->restaurantSchema($menu, $props['restaurant']['url'])],
        ]);

        return Inertia::render('Public/Menu', $props);
    }

    /**
     * Structured data so search engines see the business behind the QR code
     * even though the page itself is a client-rendered SPA.
     */
    private function restaurantSchema(Menu $menu, string $restaurantUrl): array
    {
        $restaurant = $menu->restaurant;

        return [
            '@context' => 'https://schema.org',
            '@type' => 'Restaurant',
            'name' => $restaurant->translation()->name,
            'hasMenu' => $menu->name ?: $restaurant->translation()->name.' menu',
            'url' => $restaurantUrl,
            'telephone' => null,
            'address' => $restaurant->address,
            'geo' => $restaurant->latitude !== null && $restaurant->longitude !== null ? [
                '@type' => 'GeoCoordinates',
                'latitude' => (float) $restaurant->latitude,
                'longitude' => (float) $restaurant->longitude,
            ] : null,
        ];
    }
}
