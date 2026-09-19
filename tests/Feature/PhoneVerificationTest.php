<?php

namespace Tests\Feature;

use App\Models\PhoneVerification;
use App\Models\User;
use App\Services\Otp\OtpSender;
use App\Services\Otp\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PhoneVerificationTest extends TestCase
{
    use RefreshDatabase;

    private OtpService $otpService;

    private string $lastCode = '';

    protected function setUp(): void
    {
        parent::setUp();

        $sender = new class implements OtpSender
        {
            public string $lastCode = '';

            public function send(string $countryCode, string $phone, string $code): void
            {
                $this->lastCode = $code;
            }
        };

        $this->app->instance(OtpSender::class, $sender);
        $this->otpService = new OtpService($sender, 10, 6);
        $this->app->instance(OtpService::class, $this->otpService);

        $this->lastCode = &$sender->lastCode;
    }

    public function test_unverified_user_is_redirected_to_onboarding(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/dashboard')->assertRedirect(route('onboarding.phone'));

        $this->actingAs($user)
            ->get(route('onboarding.phone'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Onboarding/Phone'));
    }

    public function test_sending_code_stores_verification_and_flashes_dev_code(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('onboarding.phone.send'), [
                'country_code' => '+20',
                'phone' => '1000000000',
            ])
            ->assertRedirect(route('onboarding.verify'))
            ->assertSessionHas('otp.dev_code', $this->lastCode);

        $this->assertDatabaseHas('phone_verifications', [
            'user_id' => $user->id,
            'country_code' => '+20',
            'phone' => '1000000000',
            'verified_at' => null,
        ]);
    }

    public function test_user_can_verify_with_the_sent_code(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('onboarding.phone.send'), [
            'country_code' => '+20',
            'phone' => '1000000000',
        ]);

        $this->actingAs($user)
            ->post(route('onboarding.verify.post'), ['code' => $this->lastCode])
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('success');

        $this->assertTrue($user->refresh()->hasVerifiedPhone());
        $this->assertSame('+20', $user->country_code);
        $this->assertSame('1000000000', $user->phone);
        $this->assertNotNull(PhoneVerification::latest('id')->first()->verified_at);
    }

    public function test_wrong_code_increments_attempts_and_blocks_after_max(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('onboarding.phone.send'), [
            'country_code' => '+20',
            'phone' => '1000000000',
        ]);

        $verification = PhoneVerification::latest('id')->first();

        for ($i = 0; $i < PhoneVerification::MAX_ATTEMPTS; $i++) {
            $this->actingAs($user)
                ->post(route('onboarding.verify.post'), ['code' => '000000'])
                ->assertSessionHasErrors('code');
        }

        $this->assertSame(PhoneVerification::MAX_ATTEMPTS, $verification->refresh()->attempts);
        $this->assertFalse($user->refresh()->hasVerifiedPhone());

        $this->actingAs($user)
            ->post(route('onboarding.verify.post'), ['code' => $this->lastCode])
            ->assertSessionHasErrors('code');
    }

    public function test_invalid_phone_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('onboarding.phone.send'), ['country_code' => '20', 'phone' => '123'])
            ->assertSessionHasErrors(['country_code', 'phone']);
    }
}
