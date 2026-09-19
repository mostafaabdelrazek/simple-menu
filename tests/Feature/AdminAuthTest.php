<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Menu;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_page_renders(): void
    {
        $this->get(route('admin.login'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Login'));
    }

    public function test_admin_can_login(): void
    {
        $admin = Admin::factory()->create(['password' => 'secret-password']);

        $this->post(route('admin.login.post'), [
            'email' => $admin->email,
            'password' => 'secret-password',
        ])
            ->assertRedirect(route('admin.dashboard'))
            ->assertSessionHasNoErrors();

        $this->assertAuthenticatedAs($admin, 'admin');
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        Admin::factory()->create(['email' => 'admin@simplemenu.test']);

        $this->post(route('admin.login.post'), [
            'email' => 'admin@simplemenu.test',
            'password' => 'wrong-password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest('admin');
    }

    public function test_dashboard_shows_stats(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->phoneVerified()->create();
        $restaurant = Restaurant::factory()->for($user, 'owner')->create();
        Menu::factory()->for($restaurant)->create();

        $this->actingAs($admin, 'admin')
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('stats.admins', 1)
                ->where('stats.users', 1)
                ->where('stats.restaurants', 1)
                ->where('stats.menus', 1));
    }

    public function test_admin_users_page_lists_users(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);

        $this->actingAs($admin, 'admin')
            ->get(route('admin.users'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Users')
                ->has('users.data', 1)
                ->where('users.data.0.name', 'John Doe'));
    }

    public function test_admin_restaurants_page_lists_restaurants(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->phoneVerified()->create();
        Restaurant::factory()->for($user, 'owner')->create(['slug' => 'golden-kebab']);

        $this->actingAs($admin, 'admin')
            ->get(route('admin.restaurants'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Restaurants')
                ->has('restaurants.data', 1)
                ->where('restaurants.data.0.slug', 'golden-kebab'));
    }

    public function test_guest_cannot_access_admin_panel(): void
    {
        $this->get(route('admin.dashboard'))->assertRedirect(route('admin.login'));
        $this->get(route('admin.users'))->assertRedirect(route('admin.login'));
    }
}
