<?php

namespace App\Providers;

use App\Services\Otp\LogOtpSender;
use App\Services\Otp\OtpSender;
use App\Services\Otp\OtpService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(OtpSender::class, LogOtpSender::class);

        $this->app->singleton(OtpService::class, function ($app) {
            return new OtpService(
                $app->make(OtpSender::class),
                (int) config('services.otp.ttl', 10),
                (int) config('services.otp.digits', 6),
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
