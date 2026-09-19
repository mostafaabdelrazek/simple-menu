<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;

class DemoLoginController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        abort_if(! $this->isEnabled(), 404, 'Demo login is not enabled in this environment.');

        $user = User::query()->where('email', Config::get('app.demo_user_email'))->first()
            ?? User::query()->whereNotNull('phone_verified_at')->first()
            ?? User::first();

        abort_unless($user !== null, 500, 'No user found for demo login. Run: php artisan db:seed');

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        if (! $user->hasVerifiedPhone()) {
            return redirect()->route('onboarding.phone')
                ->with('success', __('Signed in as demo user. Please verify your phone to continue.'));
        }

        return redirect()->intended(route('dashboard'))->with('success', __('Signed in as demo user.'));
    }

    private function isEnabled(): bool
    {
        return (bool) Config::get('app.debug');
    }
}
