<?php

namespace App\Http\Middleware;

use App\Support\LocaleResolver;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetAppLocale
{
    /**
     * Resolve the interface locale for every web request.
     *
     * English leads the supported list so a visitor without a saved
     * preference gets the English interface rather than an arbitrary one.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supported = $this->locales();
        $locale = LocaleResolver::resolve($request, $supported);

        App::setLocale($locale);

        $response = $next($request);

        // An explicitly requested language is remembered server-side so it
        // survives the next visit even without JavaScript to write the cookie.
        $requested = $request->query('lang');

        if (is_string($requested) && in_array($requested, $supported, true)) {
            $response->headers->setCookie(cookie()->forever('simplemenu_lang', $requested));
        }

        return $response;
    }

    /**
     * @return array<int, string>
     */
    private function locales(): array
    {
        $supported = array_values(config('app.supported_locales', ['ar', 'en', 'fr']));

        return array_values(array_unique(array_merge(['en'], $supported)));
    }
}
