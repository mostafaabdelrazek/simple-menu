<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\MenuCategory;
use App\Models\MenuCategoryTranslation;
use App\Models\MenuItem;
use App\Models\MenuItemTranslation;
use App\Models\Restaurant;
use App\Models\RestaurantTranslation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_renders(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->where('locale', 'en')
                ->where('languages', ['en', 'ar', 'fr'])
                ->where('cta_url', route('auth.google'))
                ->where('example_menu_url', url('/m/menu-golden-cairo-grill')));
    }

    public function test_home_page_localises_from_the_lang_parameter(): void
    {
        $this->get('/?lang=ar')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'ar')
                ->where('cta_url', route('auth.google')));
    }

    public function test_home_page_sends_authenticated_visitors_to_their_next_step(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $this->actingAs($user)
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('cta_url', route('restaurants.create')));

        Restaurant::factory()->for($user, 'owner')->create();

        $this->actingAs($user)
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('cta_url', route('dashboard')));
    }

    public function test_public_restaurant_page_renders_with_content(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->count(2)->sequence(
                ['locale' => 'en', 'name' => 'Golden Kebab', 'description' => 'Best shawarma in town'],
                ['locale' => 'ar', 'name' => 'جولدن كباب', 'description' => 'أفضل شاورما في المدينة'],
            ), 'translations')
            ->create(['slug' => 'golden-kebab', 'maps_url' => 'https://maps.google.com/?q=30.0,31.0', 'social_links' => [
                ['name' => 'facebook', 'url' => 'https://facebook.com/golden', 'icon' => 'facebook'],
            ]]);

        $this->get(route('public.restaurant', $restaurant->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Restaurant')
                ->where('locale', 'en')
                ->where('restaurant.name', 'Golden Kebab')
                ->where('restaurant.slug', 'golden-kebab')
                ->where('restaurant.maps_url', 'https://maps.google.com/?q=30.0,31.0')
                ->where('restaurant.social_links.0.url', 'https://facebook.com/golden'));
    }

    public function test_public_restaurant_page_reports_menu_item_counts(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Golden Kebab']), 'translations')
            ->create();

        $menu = Menu::factory()->for($restaurant)->create(['languages' => ['en'], 'currency' => 'EGP']);

        $category = MenuCategory::factory()->for($menu)->create();
        MenuItem::factory()->create(['menu_category_id' => $category->id, 'price' => 30]);
        MenuItem::factory()->create(['menu_category_id' => $category->id, 'price' => 45]);

        $this->get(route('public.restaurant', $restaurant->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('menus.0.items_count', 2)
                ->where('menus.0.currency', 'EGP'));
    }

    public function test_public_restaurant_falls_back_to_coordinates_when_no_maps_link(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Fallback Cafe']), 'translations')
            ->create(['slug' => 'fallback-cafe', 'latitude' => 30.1, 'longitude' => 31.2, 'maps_url' => null]);

        $this->get(route('public.restaurant', $restaurant->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where(
                'restaurant.maps_url',
                'https://www.google.com/maps?q=30.1,31.2'
            ));
    }

    public function test_public_menu_page_renders_translated_items(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Golden Kebab']), 'translations')
            ->create();

        $menu = Menu::factory()
            ->for($restaurant)
            ->create(['slug' => 'menu-golden', 'name' => 'Main Menu', 'currency' => 'EGP', 'languages' => ['en', 'ar']]);

        $category = MenuCategory::factory()
            ->for($menu)
            ->has(MenuCategoryTranslation::factory()->count(2)->sequence(
                ['locale' => 'en', 'name' => 'Grills'],
                ['locale' => 'ar', 'name' => 'مشويات'],
            ), 'translations')
            ->create();

        MenuItem::factory()
            ->has(MenuItemTranslation::factory()->count(2)->sequence(
                ['locale' => 'en', 'name' => 'Kebab Plate', 'description' => '500g of mixed grills'],
                ['locale' => 'ar', 'name' => 'طبق كباب', 'description' => '٥٠٠ جم مشاوي مشكلة'],
            ), 'translations')
            ->create(['menu_category_id' => $category->id, 'price' => 120, 'discount_price' => 100, 'sort_order' => 0]);

        $this->get(route('public.menu', $menu->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Menu')
                ->where('locale', 'en')
                ->where('menu.name', 'Main Menu')
                ->where('menu.currency', 'EGP')
                ->has('menu.categories', 1)
                ->where('menu.categories.0.name', 'Grills')
                ->where('menu.categories.0.items.0.name', 'Kebab Plate')
                ->where('menu.categories.0.items.0.price', '120.00')
                ->where('menu.categories.0.items.0.discount_price', '100.00'));

        $this->get(route('public.menu', [$menu->slug, 'lang' => 'ar']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'ar')
                ->where('menu.categories.0.name', 'مشويات')
                ->where('menu.categories.0.items.0.name', 'طبق كباب'));
    }

    public function test_arabic_browser_prefers_arabic_when_supported(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->count(2)->sequence(
                ['locale' => 'en', 'name' => 'Golden Kebab'],
                ['locale' => 'ar', 'name' => 'جولدن كباب'],
            ), 'translations')
            ->create(['slug' => 'golden-kebab']);

        $this->withHeader('Accept-Language', 'ar-EG,ar;q=0.9,en;q=0.8')
            ->get(route('public.restaurant', $restaurant->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'ar')
                ->where('restaurant.name', 'جولدن كباب'));
    }

    public function test_saved_language_cookie_wins_over_browser_language(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->count(2)->sequence(
                ['locale' => 'en', 'name' => 'Golden Kebab'],
                ['locale' => 'ar', 'name' => 'جولدن كباب'],
            ), 'translations')
            ->create(['slug' => 'golden-kebab']);

        $this->actingAs($user)
            ->withUnencryptedCookie('simplemenu_lang', 'ar')
            ->withHeader('Accept-Language', 'en-US,en;q=0.9')
            ->get(route('public.restaurant', $restaurant->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'ar'));
    }

    public function test_explicit_lang_parameter_beats_saved_cookie(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->count(2)->sequence(
                ['locale' => 'en', 'name' => 'Golden Kebab'],
                ['locale' => 'ar', 'name' => 'جولدن كباب'],
            ), 'translations')
            ->create(['slug' => 'golden-kebab']);

        $this->withUnencryptedCookie('simplemenu_lang', 'ar')
            ->get(route('public.restaurant', [$restaurant->slug, 'lang' => 'en']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
    }

    public function test_preferred_language_falls_back_to_creation_language_when_not_supported(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'English Only Diner']), 'translations')
            ->create();

        $menu = Menu::factory()->for($restaurant)->create(['slug' => 'menu-english-only', 'languages' => ['en']]);

        $this->withUnencryptedCookie('simplemenu_lang', 'ar')
            ->withHeader('Accept-Language', 'ar-EG,ar;q=0.9,en;q=0.8')
            ->get(route('public.menu', $menu->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'en')
                ->where('languages', ['en']));
    }

    public function test_interface_language_stays_requested_when_content_language_is_missing(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->count(2)->sequence(
                ['locale' => 'en', 'name' => 'Bilingual Grill'],
                ['locale' => 'ar', 'name' => 'مشاوي ثنائية'],
            ), 'translations')
            ->create();

        $menu = Menu::factory()->for($restaurant)->create(['slug' => 'menu-bilingual', 'languages' => ['en', 'ar']]);

        // Neither page has French content, so the copy falls back to the saved
        // preference while the interface keeps the requested French.
        $this->withUnencryptedCookie('simplemenu_lang', 'ar')
            ->get('/m/'.$menu->slug.'?lang=fr')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'ar')
                ->where('ui_locale', 'fr')
                ->where('languages', ['en', 'ar']));

        $this->get('/r/'.$restaurant->slug.'?lang=fr')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'ar')
                ->where('ui_locale', 'fr'));
    }

    public function test_unknown_menu_returns_404(): void
    {
        $this->get('/m/never-existed')->assertNotFound();
    }
}
