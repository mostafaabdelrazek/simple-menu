<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PhoneVerification;
use App\Services\Otp\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PhoneVerificationController extends Controller
{
    public function __construct(private readonly OtpService $otp) {}

    public function show(): RedirectResponse|Response
    {
        if (Auth::guard('web')->user()?->hasVerifiedPhone()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Onboarding/Phone');
    }

    public function send(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'country_code' => ['required', 'string', 'max:5', 'starts_with:+'],
            'phone' => ['required', 'string', 'min:6', 'max:15', 'regex:/^[0-9]+$/'],
        ]);

        $user = Auth::guard('web')->user();

        $code = $this->otp->generate();

        PhoneVerification::query()
            ->where('user_id', $user->id)
            ->whereNull('verified_at')
            ->update(['verified_at' => now()->subSecond()]);

        $verification = $user->phoneVerifications()->create([
            'country_code' => $validated['country_code'],
            'phone' => $validated['phone'],
            'otp_hash' => Hash::make($code),
            'expires_at' => $this->otp->expiresAt(),
            'attempts' => 0,
        ]);

        $this->otp->send($validated['country_code'], $validated['phone'], $code);

        session([
            'otp.country_code' => $verification->country_code,
            'otp.phone' => $verification->phone,
            'otp.dev_code' => $code,
        ]);

        return redirect()->route('onboarding.verify');
    }

    public function showVerify(): Response
    {
        return Inertia::render('Onboarding/Verify', [
            'country_code' => session('otp.country_code'),
            'phone' => session('otp.phone'),
            'dev_code' => config('app.debug') ? session('otp.dev_code') : null,
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'digits:'.config('services.otp.digits')],
        ]);

        $user = Auth::guard('web')->user();

        $verification = $user->phoneVerifications()
            ->latest()
            ->first();

        if ($verification === null || $verification->isVerified()) {
            throw ValidationException::withMessages(['code' => __('flash.code_missing')]);
        }

        if ($verification->isLocked()) {
            throw ValidationException::withMessages(['code' => __('flash.code_attempts')]);
        }

        if ($verification->isExpired()) {
            throw ValidationException::withMessages(['code' => __('flash.code_expired')]);
        }

        if (! $verification->matches($request->string('code')->toString())) {
            $verification->increment('attempts');

            throw ValidationException::withMessages(['code' => __('flash.code_incorrect')]);
        }

        $verification->update(['verified_at' => now()]);

        $user->update([
            'country_code' => $verification->country_code,
            'phone' => $verification->phone,
            'phone_verified_at' => now(),
        ]);

        session()->forget(['otp.country_code', 'otp.phone', 'otp.dev_code']);

        return redirect()->route('dashboard')->with('success', __('flash.phone_verified'));
    }
}
