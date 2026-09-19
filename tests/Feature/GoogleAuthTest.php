<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGoogleUser(): void
    {
        $socialiteUser = $this->createMock(SocialiteUser::class);
        $socialiteUser->method('getId')->willReturn('google-id-123');
        $socialiteUser->method('getEmail')->willReturn('john@example.com');
        $socialiteUser->method('getName')->willReturn('John Doe');
        $socialiteUser->method('getAvatar')->willReturn('https://example.com/avatar.jpg');

        $provider = $this->createMock(GoogleProvider::class);
        $provider->method('user')->willReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    public function test_new_google_user_is_created_and_sent_to_phone_verification(): void
    {
        $this->fakeGoogleUser();

        $response = $this->get(route('auth.google.callback'));

        $response->assertRedirect(route('onboarding.phone'));

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'google_id' => 'google-id-123',
            'phone_verified_at' => null,
        ]);

        $this->assertAuthenticatedAs(User::where('email', 'john@example.com')->first(), 'web');
    }

    public function test_existing_verified_user_is_sent_to_dashboard(): void
    {
        $user = User::factory()->phoneVerified()->create([
            'email' => 'john@example.com',
            'google_id' => 'google-id-123',
        ]);

        $this->fakeGoogleUser();

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_google_error_redirects_to_login(): void
    {
        $this->get(route('auth.google.callback', ['error' => 'access_denied']))
            ->assertRedirect(route('login'));
    }
}
