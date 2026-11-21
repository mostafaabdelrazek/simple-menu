<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRestaurantRequest;
use App\Models\Menu;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use App\Services\Billing\BillingManager;
use App\Support\PublicPageCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class RestaurantController extends Controller
{
    /**
     * Returns the wizard page, or an Inertia "location" (409 + X-Inertia-Location)
     * response when the account is at its plan limit, so the client does a
     * full page visit to billing.
     */
    public function create(): Response|SymfonyResponse
    {
        // Send accounts that maxed out their plan straight to billing before
        // they fill in the whole wizard just to be stopped at submit.
        if (BillingManager::restaurantsLeft(Auth::guard('web')->user()) === 0) {
            return Inertia::location(route('billing', ['limit' => 1]));
        }

        return Inertia::render('Restaurant/Wizard', $this->wizardProps());
    }

    public function store(StoreRestaurantRequest $request): RedirectResponse
    {
        $user = Auth::guard('web')->user();

        $data = $request->validated();

        $itemLimit = BillingManager::itemLimit($user);

        if ($itemLimit !== null && BillingManager::countItems($data['categories']) > $itemLimit) {
            return back()->withInput()->with('error', __('billing.item_limit_reached', ['limit' => $itemLimit]));
        }

        $result = DB::transaction(function () use ($data, $user) {
            // Lock the user row so concurrent requests can't both pass the
            // plan limit check and create restaurants over the limit.
            $lockedUser = User::query()->where('id', $user->id)->lockForUpdate()->first();

            if (BillingManager::restaurantsLeft($lockedUser) === 0) {
                return redirect()->route('billing')->with('error', __('billing.restaurant_limit_reached'));
            }

            $restaurant = $this->createRestaurant($data, $lockedUser);

            $this->createMenuData($restaurant, $data);

            return $restaurant;
        });

        if ($result instanceof RedirectResponse) {
            return $result;
        }

        /** @var Restaurant $restaurant */
        $restaurant = $result;

        PublicPageCache::forgetRestaurantWithMenus($restaurant);

        return redirect()->route('restaurants.complete', $restaurant->slug);
    }

    public function edit(Restaurant $restaurant): Response
    {
        $this->authorize('update', $restaurant);

        $restaurant->load(['translations', 'menus.categories.items.translations', 'menus.categories.translations']);

        $menu = $restaurant->menus->first();

        return Inertia::render('Restaurant/Wizard', [
            ...$this->wizardProps(),
            'is_editing' => true,
            'restaurant_slug' => $restaurant->slug,
            'existing' => [
                'restaurant' => [
                    'languages' => $restaurant->translations->pluck('locale')->values()->all(),
                    'translations' => $restaurant->translations
                        ->mapWithKeys(fn ($translation) => [
                            $translation->locale => [
                                'name' => $translation->name,
                                'description' => $translation->description ?? '',
                            ],
                        ])
                        ->all(),
                    'social_links' => $restaurant->social_links ?? [],
                    'latitude' => $restaurant->latitude !== null ? rtrim(rtrim((string) $restaurant->latitude, '0'), '.') : '',
                    'longitude' => $restaurant->longitude !== null ? rtrim(rtrim((string) $restaurant->longitude, '0'), '.') : '',
                    'maps_url' => $restaurant->maps_url ?? '',
                    'address' => $restaurant->address ?? '',
                    'banner' => $this->imageValue($restaurant->banner),
                    'logo' => $this->imageValue($restaurant->logo),
                ],
                'menu' => $menu !== null ? [
                    'name' => $menu->name ?? '',
                    'currency' => $menu->currency,
                    'languages' => $menu->languages,
                    'theme' => $menu->theme(),
                ] : null,
                'categories' => ($menu?->categories ?? collect())->map(function ($category) {
                    return [
                        'translations' => $category->translations
                            ->mapWithKeys(fn ($translation) => [$translation->locale => ['name' => $translation->name]])
                            ->all(),
                        'items' => $category->items->map(function ($item) {
                            return [
                                'price' => rtrim(rtrim((string) $item->price, '0'), '.'),
                                'discount_price' => $item->discount_price !== null
                                    ? rtrim(rtrim((string) $item->discount_price, '0'), '.')
                                    : '',
                                'image' => $this->imageValue($item->image),
                                'translations' => $item->translations
                                    ->mapWithKeys(fn ($translation) => [
                                        $translation->locale => [
                                            'name' => $translation->name,
                                            'description' => $translation->description ?? '',
                                        ],
                                    ])
                                    ->all(),
                            ];
                        })->values()->all(),
                    ];
                })->values()->all(),
            ],
        ]);
    }

    public function update(StoreRestaurantRequest $request, Restaurant $restaurant): RedirectResponse
    {
        $this->authorize('update', $restaurant);

        $user = Auth::guard('web')->user();

        $data = $request->validated();

        $itemLimit = BillingManager::itemLimit($user);

        if ($itemLimit !== null && BillingManager::countItems($data['categories']) > $itemLimit) {
            return back()->withInput()->with('error', __('billing.item_limit_reached', ['limit' => $itemLimit]));
        }

        DB::transaction(function () use ($restaurant, $data) {
            $restaurant->update([
                'latitude' => $data['restaurant']['latitude'] ?? null,
                'longitude' => $data['restaurant']['longitude'] ?? null,
                'maps_url' => $data['restaurant']['maps_url'] ?? null,
                'address' => $data['restaurant']['address'] ?? null,
                'banner' => $data['restaurant']['banner'] ?? null,
                'logo' => $data['restaurant']['logo'] ?? null,
                'social_links' => $data['restaurant']['social_links'] ?? [],
            ]);

            $restaurant->translations()->delete();

            foreach ($data['restaurant']['translations'] as $locale => $translation) {
                $restaurant->translations()->create([
                    'locale' => $locale,
                    'name' => $translation['name'],
                    'description' => $translation['description'] ?? null,
                ]);
            }

            $menu = $restaurant->menus()->first();

            if ($menu !== null) {
                $menu->update([
                    'name' => $data['menu']['name'] ?? null,
                    'currency' => $data['menu']['currency'],
                    'languages' => $data['menu']['languages'],
                    ...$this->themeAttributes($data),
                ]);
            } else {
                $menu = $this->createMenu($restaurant, $data);
            }

            $menu->categories()->delete();

            $this->createCategories($menu, $data['categories']);
        });

        PublicPageCache::forgetRestaurantWithMenus($restaurant);

        return redirect()->route('restaurants.complete', $restaurant->slug)
            ->with('success', __('flash.updated'));
    }

    /**
     * @return array<string, mixed>
     */
    private function wizardProps(): array
    {
        return [
            'supported_locales' => config('app.supported_locales', ['ar', 'en', 'fr']),
            'default_social_links' => [
                ['name' => 'facebook', 'url' => '', 'icon' => 'facebook'],
                ['name' => 'tiktok', 'url' => '', 'icon' => 'tiktok'],
                ['name' => 'instagram', 'url' => '', 'icon' => 'instagram'],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createRestaurant(array $data, $user): Restaurant
    {
        return Restaurant::create([
            'user_id' => $user->id,
            'slug' => $this->uniqueSlug(Restaurant::class, $this->baseSlug($data['restaurant']['translations'])),
            'latitude' => $data['restaurant']['latitude'] ?? null,
            'longitude' => $data['restaurant']['longitude'] ?? null,
            'maps_url' => $data['restaurant']['maps_url'] ?? null,
            'address' => $data['restaurant']['address'] ?? null,
            'banner' => $data['restaurant']['banner'] ?? null,
            'logo' => $data['restaurant']['logo'] ?? null,
            'social_links' => $data['restaurant']['social_links'] ?? [],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createMenuData(Restaurant $restaurant, array $data): void
    {
        foreach ($data['restaurant']['translations'] as $locale => $translation) {
            $restaurant->translations()->create([
                'locale' => $locale,
                'name' => $translation['name'],
                'description' => $translation['description'] ?? null,
            ]);
        }

        $menu = $this->createMenu($restaurant, $data);

        $this->createCategories($menu, $data['categories']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createMenu(Restaurant $restaurant, array $data): Menu
    {
        return Menu::create([
            'restaurant_id' => $restaurant->id,
            'slug' => $this->uniqueSlug(Menu::class, 'menu-'.$restaurant->slug),
            'name' => $data['menu']['name'] ?? null,
            'currency' => $data['menu']['currency'],
            'languages' => $data['menu']['languages'],
            ...$this->themeAttributes($data),
        ]);
    }

    /**
     * The validated theme, normalised to lowercase hex.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, string|null>
     */
    private function themeAttributes(array $data): array
    {
        $theme = $data['menu']['theme'] ?? [];

        return [
            'theme_background' => isset($theme['background']) ? strtolower($theme['background']) : null,
            'theme_primary' => isset($theme['primary']) ? strtolower($theme['primary']) : null,
            'theme_font' => $theme['font'] ?? null,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $categories
     */
    private function createCategories(Menu $menu, array $categories): void
    {
        foreach ($categories as $index => $categoryData) {
            $category = MenuCategory::create([
                'menu_id' => $menu->id,
                'sort_order' => $index,
            ]);

            foreach ($categoryData['translations'] as $locale => $translation) {
                $category->translations()->create([
                    'locale' => $locale,
                    'name' => $translation['name'],
                ]);
            }

            foreach ($categoryData['items'] ?? [] as $itemIndex => $itemData) {
                $item = MenuItem::create([
                    'menu_category_id' => $category->id,
                    'price' => $itemData['price'],
                    'discount_price' => $itemData['discount_price'] ?? null,
                    'image' => $itemData['image'] ?? null,
                    'sort_order' => $itemIndex,
                ]);

                foreach ($itemData['translations'] as $locale => $translation) {
                    $item->translations()->create([
                        'locale' => $locale,
                        'name' => $translation['name'],
                        'description' => $translation['description'] ?? null,
                    ]);
                }
            }
        }
    }

    /**
     * @return array{url: string, path: string}|null
     */
    private function imageValue(?string $path): ?array
    {
        if ($path === null || $path === '') {
            return null;
        }

        return [
            'url' => custom_asset('storage/'.$path),
            'path' => $path,
        ];
    }

    public function complete(Restaurant $restaurant): Response
    {
        $this->authorize('update', $restaurant);

        $menu = $restaurant->menus()->first();

        return Inertia::render('Restaurant/Complete', [
            'restaurant' => [
                'slug' => $restaurant->slug,
                'name' => $restaurant->translation()->name,
                'profile_url' => route('public.restaurant', $restaurant->slug),
                'menu_url' => $menu !== null ? route('public.menu', $menu->slug) : null,
            ],
        ]);
    }

    /**
     * @param  array<string, mixed>  $translations
     */
    private function baseSlug(array $translations): string
    {
        $name = $translations['en']['name'] ?? reset($translations)['name'] ?? 'restaurant';

        return Str::slug($name);
    }

    private function uniqueSlug(string $model, string $slug): string
    {
        $base = $slug !== '' ? $slug : Str::slug(Str::random(6));
        $candidate = $base;

        while ($model::query()->where('slug', $candidate)->exists()) {
            $candidate = $base.'-'.Str::lower(Str::random(5));
        }

        return $candidate;
    }
}
