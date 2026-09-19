<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\MenuItemTranslation;
use App\Models\Restaurant;
use App\Models\RestaurantTranslation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RestaurantCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_wizard_page_requires_phone_verification(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('restaurants.create'))->assertRedirect(route('onboarding.phone'));
    }

    public function test_wizard_page_renders(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $this->actingAs($user)
            ->get(route('restaurants.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Restaurant/Wizard')
                ->has('supported_locales', 3)
                ->has('default_social_links'));
    }

    public function test_full_wizard_payload_creates_restaurant_and_menu(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $response = $this->actingAs($user)->post(route('restaurants.store'), [
            'restaurant' => [
                'languages' => ['en', 'ar'],
                'translations' => [
                    'en' => ['name' => 'Golden Kebab', 'description' => 'Best shawarma in town'],
                    'ar' => ['name' => 'جولدن كباب', 'description' => 'أفضل شاورما في المدينة'],
                ],
                'social_links' => [
                    ['name' => 'facebook', 'url' => 'https://facebook.com/golden', 'icon' => 'facebook'],
                ],
                'latitude' => 30.0444,
                'longitude' => 31.2357,
                'maps_url' => 'https://maps.google.com/?q=30.0444,31.2357',
                'address' => '15 Tahrir St, Cairo',
            ],
            'menu' => [
                'name' => 'Main Menu',
                'currency' => 'EGP',
                'languages' => ['en', 'ar'],
            ],
            'categories' => [
                [
                    'translations' => [
                        'en' => ['name' => 'Grills'],
                        'ar' => ['name' => 'مشويات'],
                    ],
                    'items' => [
                        [
                            'price' => 120,
                            'discount_price' => 100,
                            'translations' => [
                                'en' => ['name' => 'Kebab Plate', 'description' => '500g of mixed grills'],
                                'ar' => ['name' => 'طبق كباب', 'description' => '٥٠٠ جم مشاوي مشكلة'],
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertRedirect();

        $restaurant = Restaurant::query()->where('user_id', $user->id)->firstOrFail();
        $menu = Menu::query()->where('restaurant_id', $restaurant->id)->firstOrFail();

        $this->assertSame('golden-kebab', $restaurant->slug);
        $this->assertSame('https://maps.google.com/?q=30.0444,31.2357', $restaurant->maps_url);
        $this->assertEqualsCanonicalizing(['ar', 'en'], $restaurant->translations()->pluck('locale')->all());
        $this->assertSame(['en', 'ar'], $menu->languages);
        $this->assertSame('EGP', $menu->currency);
        $this->assertSame(1, $menu->categories()->count());

        $category = $menu->categories()->firstOrFail();
        $this->assertSame(1, $category->items()->count());
        $this->assertEquals(120, $category->items()->firstOrFail()->price);

        $vs = $this->actingAs($user)->get($response->headers->get('Location'));
        $vs->assertOk();
        $vs->assertInertia(fn (Assert $page) => $page
            ->component('Restaurant/Complete')
            ->where('restaurant.name', 'Golden Kebab'));
    }

    public function test_menu_languages_must_be_subset_of_restaurant_languages(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $this->actingAs($user)->post(route('restaurants.store'), [
            'restaurant' => [
                'languages' => ['en'],
                'translations' => ['en' => ['name' => 'Golden Kebab']],
            ],
            'menu' => [
                'currency' => 'EGP',
                'languages' => ['ar'],
            ],
            'categories' => [
                [
                    'translations' => ['ar' => ['name' => 'مشويات']],
                ],
            ],
        ])->assertSessionHasErrors('menu.languages');
    }

    public function test_category_translation_locale_must_be_in_menu_languages(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $this->actingAs($user)->post(route('restaurants.store'), [
            'restaurant' => [
                'languages' => ['en'],
                'translations' => ['en' => ['name' => 'Golden Kebab']],
            ],
            'menu' => [
                'currency' => 'EGP',
                'languages' => ['en'],
            ],
            'categories' => [
                [
                    'translations' => ['ar' => ['name' => 'مشويات']],
                ],
            ],
        ])->assertSessionHasErrors('categories.0.translations');
    }

    public function test_complete_page_is_blocked_for_non_owners(): void
    {
        $owner = User::factory()->phoneVerified()->create();
        $intruder = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($owner, 'owner')
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Golden Kebab']), 'translations')
            ->create(['slug' => 'golden-kebab']);

        $this->actingAs($intruder)
            ->get(route('restaurants.complete', $restaurant->slug))
            ->assertForbidden();

        $this->actingAs($owner)
            ->get(route('restaurants.complete', $restaurant->slug))
            ->assertOk();
    }

    public function test_edit_page_prefills_existing_data(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->count(2)->sequence(
                ['locale' => 'en', 'name' => 'Golden Kebab'],
                ['locale' => 'ar', 'name' => 'جولدن كباب'],
            ), 'translations')
            ->create(['slug' => 'golden-kebab']);

        $menu = Menu::factory()->for($restaurant)->create(['slug' => 'menu-golden', 'name' => 'Main Menu', 'currency' => 'EGP', 'languages' => ['en', 'ar']]);

        $category = MenuCategory::factory()->for($menu)->create();

        MenuItem::factory()
            ->has(MenuItemTranslation::factory()->state(['locale' => 'en', 'name' => 'Kebab Plate']), 'translations')
            ->create(['menu_category_id' => $category->id, 'price' => 120]);

        $this->actingAs($user)
            ->get(route('restaurants.edit', $restaurant->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Restaurant/Wizard')
                ->where('is_editing', true)
                ->where('restaurant_slug', 'golden-kebab')
                ->where('existing.restaurant.translations.en.name', 'Golden Kebab')
                ->where('existing.menu.currency', 'EGP')
                ->where('existing.categories.0.items.0.price', '120')
                ->where('existing.categories.0.items.0.translations.en.name', 'Kebab Plate'));
    }

    public function test_user_can_update_restaurant_menu_and_categories(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Golden Kebab']), 'translations')
            ->create(['slug' => 'golden-kebab']);

        $menu = Menu::factory()->for($restaurant)->create(['slug' => 'menu-golden', 'name' => 'Main Menu', 'currency' => 'EGP', 'languages' => ['en']]);

        $category = MenuCategory::factory()->for($menu)->create();
        MenuItem::factory()->create(['menu_category_id' => $category->id, 'price' => 120]);

        $response = $this->actingAs($user)->put(route('restaurants.update', $restaurant->slug), [
            'restaurant' => [
                'languages' => ['en', 'ar'],
                'translations' => [
                    'en' => ['name' => 'Golden Kebab Updated', 'description' => 'Fresh ingredients'],
                    'ar' => ['name' => 'جولدن كباب', 'description' => 'مكونات طازجة'],
                ],
                'social_links' => [],
                'address' => '20 Downtown St, Cairo',
            ],
            'menu' => [
                'name' => 'Updated Menu',
                'currency' => 'USD',
                'languages' => ['en', 'ar'],
            ],
            'categories' => [
                [
                    'translations' => ['en' => ['name' => 'Mains'], 'ar' => ['name' => 'أطباق رئيسية']],
                    'items' => [
                        [
                            'price' => 80,
                            'translations' => [
                                'en' => ['name' => 'Beef Kebab', 'description' => 'Grilled'],
                                'ar' => ['name' => 'كباب لحم'],
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertRedirect(route('restaurants.complete', $restaurant->slug));

        $this->assertSame('golden-kebab', $restaurant->fresh()->slug);
        $this->assertSame('20 Downtown St, Cairo', $restaurant->fresh()->address);

        $freshMenu = $menu->fresh();
        $this->assertSame('Updated Menu', $freshMenu->name);
        $this->assertSame('USD', $freshMenu->currency);
        $this->assertSame(['en', 'ar'], $freshMenu->languages);
        $this->assertSame(1, $freshMenu->categories()->count());
        $this->assertSame('80.00', $freshMenu->categories()->first()->items()->first()->price);

        $restaurant->load('translations');
        $this->assertSame('Golden Kebab Updated', $restaurant->translation('en')->name);
        $this->assertEqualsCanonicalizing(['ar', 'en'], $restaurant->translations->pluck('locale')->all());
    }

    public function test_update_is_forbidden_for_non_owners(): void
    {
        $owner = User::factory()->phoneVerified()->create();
        $intruder = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($owner, 'owner')
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Golden Kebab']), 'translations')
            ->create();

        $this->actingAs($intruder)
            ->put(route('restaurants.update', $restaurant->slug), [
                'restaurant' => ['languages' => ['en'], 'translations' => ['en' => ['name' => 'Hacked']], 'social_links' => []],
                'menu' => ['currency' => 'EGP', 'languages' => ['en']],
                'categories' => [['translations' => ['en' => ['name' => 'X']]]],
            ])
            ->assertForbidden();

        $this->actingAs($intruder)
            ->get(route('restaurants.edit', $restaurant->slug))
            ->assertForbidden();
    }
}
