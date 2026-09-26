<?php

namespace App\Http\Controllers;

use App\Support\LocaleResolver;
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

        return Inertia::render('Home', [
            'locale' => $locale,
            'languages' => $this->languages(),
            'cta_url' => $this->ctaUrl($request),
            'example_menu_url' => url('/m/menu-golden-cairo-grill'),
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
            return route('auth.google');
        }

        return $request->user()->restaurants()->exists()
            ? route('dashboard')
            : route('restaurants.create');
    }
}
