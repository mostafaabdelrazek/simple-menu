<?php

namespace App\Providers;

use App\Services\Otp\LogOtpSender;
use App\Services\Otp\OtpSender;
use App\Services\Otp\OtpService;
use Illuminate\Support\Facades\Vite;
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
        $this->registerAssetVersionQueryString();
    }

    /**
     * Append the configured ASSET_VERSION (?v=x.x.x) to every Vite-built asset.
     */
    private function registerAssetVersionQueryString(): void
    {
        $version = config('app.asset_version') ?: null;

        if ($version === null) {
            return;
        }

        $withVersion = static function (string $url) use ($version): string {
            if (Vite::isRunningHot()) {
                return $url;
            }

            $separator = str_contains($url, '?') ? '&' : '?';

            return $url.$separator.'v='.$version;
        };

        Vite::useScriptTagAttributes(fn ($src, $url) => ['src' => $withVersion($url)]);
        Vite::useStyleTagAttributes(fn ($src, $url) => ['href' => $withVersion($url)]);
        Vite::usePreloadTagAttributes(fn ($src, $url) => ['href' => $withVersion($url)]);
    }
}
