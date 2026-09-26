<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\Restaurant;
use App\Models\RestaurantTranslation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MenuThemeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function payload(array $menu = []): array
    {
        return [
            'restaurant' => [
                'languages' => ['en'],
                'translations' => ['en' => ['name' => 'Golden Kebab']],
            ],
            'menu' => array_merge([
                'currency' => 'EGP',
                'languages' => ['en'],
            ], $menu),
            'categories' => [
                ['translations' => ['en' => ['name' => 'Grills']]],
            ],
        ];
    }

    private function owner(): User
    {
        return User::factory()->phoneVerified()->create();
    }

    public function test_theme_is_stored_on_the_menu(): void
    {
        $user = $this->owner();

        $this->actingAs($user)->post(route('restaurants.store'), $this->payload([
            'theme' => ['background' => '#FDF2F8', 'primary' => '#500724', 'font' => 'serif'],
        ]))->assertRedirect();

        $menu = Menu::query()->firstOrFail();

        $this->assertSame('#fdf2f8', $menu->theme_background);
        $this->assertSame('#500724', $menu->theme_primary);
        $this->assertSame('serif', $menu->theme_font);
    }

    public function test_a_menu_without_a_theme_falls_back_to_the_default(): void
    {
        $user = $this->owner();

        $this->actingAs($user)->post(route('restaurants.store'), $this->payload())->assertRedirect();

        $menu = Menu::query()->firstOrFail();

        $this->assertSame(Menu::DEFAULT_THEME, $menu->theme());
    }

    public function test_colours_must_be_hex_values(): void
    {
        $user = $this->owner();

        $this->actingAs($user)
            ->post(route('restaurants.store'), $this->payload([
                'theme' => ['background' => 'red', 'primary' => '#12345'],
            ]))
            ->assertSessionHasErrors(['menu.theme.background', 'menu.theme.primary']);

        $this->assertSame(0, Menu::query()->count());
    }

    public function test_the_font_must_be_one_of_the_offered_families(): void
    {
        $user = $this->owner();

        $this->actingAs($user)
            ->post(route('restaurants.store'), $this->payload(['theme' => ['font' => 'comic-sans']]))
            ->assertSessionHasErrors('menu.theme.font');
    }

    public function test_editing_replaces_the_theme(): void
    {
        $user = $this->owner();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Golden Kebab']), 'translations')
            ->create(['slug' => 'golden-kebab']);

        $menu = Menu::factory()->for($restaurant)->create([
            'slug' => 'menu-golden',
            'languages' => ['en'],
            'theme_background' => '#0c0a09',
            'theme_font' => 'sans',
        ]);

        $this->actingAs($user)->put(route('restaurants.update', $restaurant->slug), [
            'restaurant' => [
                'languages' => ['en'],
                'translations' => ['en' => ['name' => 'Golden Kebab Renamed']],
            ],
            'menu' => [
                'currency' => 'EGP',
                'languages' => ['en'],
                'theme' => ['background' => '#ffffff', 'primary' => '#171717', 'font' => 'mono'],
            ],
            'categories' => [
                ['translations' => ['en' => ['name' => 'Grills']]],
            ],
        ])->assertRedirect();

        $menu->refresh();

        $this->assertSame('#ffffff', $menu->theme_background);
        $this->assertSame('#171717', $menu->theme_primary);
        $this->assertSame('mono', $menu->theme_font);
    }

    public function test_the_wizard_is_prefilled_with_the_current_theme(): void
    {
        $user = $this->owner();

        $restaurant = Restaurant::factory()
            ->for($user, 'owner')
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Golden Kebab']), 'translations')
            ->create(['slug' => 'golden-kebab']);

        Menu::factory()->for($restaurant)->create([
            'slug' => 'menu-golden',
            'languages' => ['en'],
            'theme_background' => '#faf7f0',
            'theme_primary' => '#1c1917',
            'theme_font' => 'serif',
        ]);

        $this->actingAs($user)
            ->get(route('restaurants.edit', $restaurant->slug))
            ->assertInertia(fn (Assert $page) => $page
                ->where('existing.menu.theme.background', '#faf7f0')
                ->where('existing.menu.theme.primary', '#1c1917')
                ->where('existing.menu.theme.font', 'serif'));
    }

    public function test_the_public_menu_page_publishes_its_theme(): void
    {
        $restaurant = Restaurant::factory()
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Golden Kebab']), 'translations')
            ->create(['slug' => 'golden-kebab']);

        $menu = Menu::factory()->for($restaurant)->create([
            'slug' => 'menu-golden',
            'languages' => ['en'],
            'theme_background' => '#0f172a',
            'theme_primary' => '#e0f2fe',
            'theme_font' => 'system',
        ]);

        $this->get(route('public.menu', $menu->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Menu')
                ->where('theme.background', '#0f172a')
                ->where('theme.primary', '#e0f2fe')
                ->where('theme.font', 'system'));
    }

    public function test_the_restaurant_page_wears_its_first_menus_theme(): void
    {
        $restaurant = Restaurant::factory()
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Golden Kebab']), 'translations')
            ->create(['slug' => 'golden-kebab']);

        $first = Menu::factory()->for($restaurant)->create([
            'slug' => 'menu-lunch',
            'languages' => ['en'],
            'theme_background' => '#1c1917',
            'theme_primary' => '#fef3c7',
            'theme_font' => 'serif',
        ]);

        Menu::factory()->for($restaurant)->create([
            'slug' => 'menu-dinner',
            'languages' => ['en'],
            'theme_background' => '#ffffff',
            'theme_font' => 'mono',
        ]);

        $this->get(route('public.restaurant', $restaurant->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Restaurant')
                ->where('theme.background', '#1c1917')
                ->where('theme.font', 'serif'));
    }

    public function test_a_restaurant_without_menus_still_renders_with_the_default_theme(): void
    {
        $restaurant = Restaurant::factory()
            ->has(RestaurantTranslation::factory()->state(['locale' => 'en', 'name' => 'Golden Kebab']), 'translations')
            ->create(['slug' => 'golden-kebab']);

        $this->get(route('public.restaurant', $restaurant->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('theme', Menu::DEFAULT_THEME));
    }
}
