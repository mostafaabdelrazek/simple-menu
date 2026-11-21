<?php

namespace App\Http\Controllers;

use App\Services\Billing\BillingManager;
use App\Support\LocaleResolver;
use App\Support\Seo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $locale = LocaleResolver::resolve($request, $this->languages());

        App::setLocale($locale);

        // The server-rendered head needs its own meta even though the SPA
        // re-renders a richer head client-side once React takes over.
        Seo::share($request, __('landing.meta_title'), __('landing.meta_description'), [
            'jsonld' => [$this->webApplicationSchema()],
        ]);

        return Inertia::render('Home', [
            'locale' => $locale,
            'languages' => $this->languages(),
            'cta_url' => $this->ctaUrl($request),
            'example_menu_url' => url('/m/menu-golden-cairo-grill'),
            'plans' => BillingManager::publicPlans(),
        ]);
    }

    /**
     * English leads so visitors without a saved preference get the canonical
     * landing page instead of the localized one.
     *
     * @return array<int, string>
     */
    private function languages(): array
    {
        $languages = array_values(config('app.supported_locales', ['ar', 'en', 'fr']));

        return array_values(array_unique(array_merge(['en'], $languages)));
    }

    private function ctaUrl(Request $request): string
    {
        if (! $request->user()) {
            return route('login');
        }

        return $request->user()->restaurants()->exists()
            ? route('dashboard')
            : route('restaurants.create');
    }

    private function webApplicationSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebApplication',
            'name' => config('app.name', 'SimpleMenu'),
            'url' => url('/'),
            'applicationCategory' => 'BusinessApplication',
            'operatingSystem' => 'Any',
            'inLanguage' => config('app.supported_locales', ['ar', 'en', 'fr']),
        ];
    }
}
