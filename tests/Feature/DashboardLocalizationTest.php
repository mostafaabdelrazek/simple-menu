<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\RestaurantTranslation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardLocalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_shares_the_requested_locale_and_its_dictionary(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $this->actingAs($user)
            ->get(route('dashboard').'?lang=ar')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Index')
                ->where('locale', 'ar')
                // The dictionary is flat, so its keys keep their dots.
                ->where('translations', fn ($lines) => $lines['common.copy'] === __('common.copy', [], 'ar')
                    && $lines['dashboard.title'] === __('dashboard.title', [], 'ar')))
            // simplemenu_lang is deliberately unencrypted: the public language
            // switcher writes it from JavaScript, so the server does too.
            ->assertCookie('simplemenu_lang', 'ar', encrypted: false);
    }

    public function test_french_is_available_on_every_dashboard_page(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $this->actingAs($user)
            ->get(route('restaurants.create').'?lang=fr')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'fr')
                ->where('translations', fn ($lines) => $lines['wizard.appearance_title'] === 'Apparence'));
    }

    public function test_the_chosen_locale_survives_the_next_request(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $this->actingAs($user)
            ->get(route('dashboard').'?lang=fr')
            ->assertCookie('simplemenu_lang', 'fr', encrypted: false);

        $this->actingAs($user)
            ->withUnencryptedCookie('simplemenu_lang', 'fr')
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'fr'));
    }

    public function test_an_unsupported_locale_falls_back_to_english(): void
    {
        $user = User::factory()->phoneVerified()->create();

        $this->actingAs($user)
            ->get(route('dashboard').'?lang=de')
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'en')
                ->where('translations', fn ($lines) => $lines['common.copy'] === 'Copy'));
    }

    public function test_public_pages_keep_their_own_locales(): void
    {
        $restaurant = Restaurant::factory()
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Golden Kebab']), 'translations')
            ->has(RestaurantTranslation::factory()->state(['locale' => 'ar', 'name' => 'جولدن كباب']), 'translations')
            ->create(['slug' => 'golden-kebab']);

        $menu = Menu::factory()->for($restaurant)->create(['slug' => 'menu-golden', 'languages' => ['en', 'ar']]);

        $category = MenuCategory::factory()->for($menu)->create();

        MenuItem::factory()->create(['menu_category_id' => $category->id]);

        // A guest following a ?lang= link still gets a locale the menu serves.
        $this->get(route('public.menu', $menu->slug).'?lang=ar')
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'ar')
                ->where('restaurant.name', 'جولدن كباب'));

        $this->get(route('public.menu', $menu->slug).'?lang=fr')
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
    }

    public function test_flash_messages_are_translated(): void
    {
        config(['app.debug' => true]);
        User::factory()->create(['email' => 'demo@simplemenu.test']);

        $this->post(route('demo.login', ['lang' => 'ar']))
            ->assertSessionHas('success', __('flash.signed_in_verify', [], 'ar'));
    }

    public function test_the_three_dictionaries_stay_in_step(): void
    {
        $english = json_decode((string) file_get_contents(lang_path('en.json')), true);
        $arabic = json_decode((string) file_get_contents(lang_path('ar.json')), true);
        $french = json_decode((string) file_get_contents(lang_path('fr.json')), true);

        $this->assertSame([], array_diff(array_keys($english), array_keys($arabic)));
        $this->assertSame([], array_diff(array_keys($english), array_keys($french)));
        $this->assertNotEmpty($english);
    }
}
