<?php

namespace App\Support;

use App\Models\Menu;
use App\Models\Restaurant;
use Closure;

/**
 * Response cache for the public pages.
 *
 * The restaurant profile and the public menu are the hot path of the product
 * (every QR scan hits them), so the mapped Inertia props are cached per
 * entity + locale. Anything that writes restaurant or menu data — the owner
 * wizard, the admin moderation tools — invalidates precisely the entities
 * that changed instead of flushing the whole cache.
 */
final class PublicPageCache
{
    public const RESTAURANT_KEY = 'public:restaurant:';

    public const MENU_KEY = 'public:menu:';

    /**
     * @return array<string, mixed>
     */
    public static function rememberRestaurant(Restaurant $restaurant, string $locale, Closure $resolver): array
    {
        if (! self::enabled()) {
            return $resolver();
        }

        return cache()->remember(
            self::RESTAURANT_KEY.$restaurant->id.':'.$locale,
            self::ttl(),
            $resolver
        );
    }

    /**
     * @return array<string, mixed>
     */
    public static function rememberMenu(Menu $menu, string $locale, Closure $resolver): array
    {
        if (! self::enabled()) {
            return $resolver();
        }

        return cache()->remember(
            self::MENU_KEY.$menu->id.':'.$locale,
            self::ttl(),
            $resolver
        );
    }

    /**
     * Drop the cached props of one restaurant page.
     */
    public static function forgetRestaurant(Restaurant|int $restaurant): void
    {
        if (! self::enabled()) {
            return;
        }

        $id = $restaurant instanceof Restaurant ? $restaurant->id : $restaurant;

        foreach (config('app.supported_locales', ['ar', 'en', 'fr']) as $locale) {
            cache()->forget(self::RESTAURANT_KEY.$id.':'.$locale);
        }
    }

    /**
     * Drop the cached props of one menu page.
     */
    public static function forgetMenu(Menu|int $menu): void
    {
        if (! self::enabled()) {
            return;
        }

        $id = $menu instanceof Menu ? $menu->id : $menu;

        foreach (config('app.supported_locales', ['ar', 'en', 'fr']) as $locale) {
            cache()->forget(self::MENU_KEY.$id.':'.$locale);
        }
    }

    /**
     * Drop a restaurant's own page and every menu under it — used whenever a
     * restaurant-level write might affect all of them (suspend, restore, delete).
     */
    public static function forgetRestaurantWithMenus(Restaurant|int $restaurant): void
    {
        self::forgetRestaurant($restaurant);

        $id = $restaurant instanceof Restaurant ? $restaurant->id : $restaurant;

        Restaurant::query()->find($id)
            ?->menus()
            ->pluck('id')
            ->each(fn (int $menuId) => self::forgetMenu($menuId));
    }

    private static function enabled(): bool
    {
        return (bool) config('billing.public_cache.enabled', true);
    }

    private static function ttl(): int
    {
        return max(60, (int) config('billing.public_cache.ttl', 3600));
    }
}
