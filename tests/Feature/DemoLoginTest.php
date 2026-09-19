<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_login_signs_in_the_configured_user_when_debug_is_enabled(): void
    {
        config(['app.debug' => true]);
        $user = User::factory()->phoneVerified()->create(['email' => 'demo@simplemenu.test']);

        $this->post(route('demo.login'))
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_unverified_demo_user_can_still_sign_in_and_is_sent_to_onboarding(): void
    {
        config(['app.debug' => true]);
        User::factory()->create(['email' => 'demo@simplemenu.test']);

        $this->post(route('demo.login'))
            ->assertRedirect(route('onboarding.phone'));

        $this->assertAuthenticated('web');
    }

    public function test_demo_login_is_disabled_outside_debug_mode(): void
    {
        config(['app.debug' => false]);
        User::factory()->phoneVerified()->create(['email' => 'demo@simplemenu.test']);

        $this->post(route('demo.login'))->assertNotFound();
    }
}
