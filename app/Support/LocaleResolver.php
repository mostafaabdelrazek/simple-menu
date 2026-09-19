<?php

namespace App\Support;

use Illuminate\Http\Request;

class LocaleResolver
{
    /**
     * Resolve the preferred locale for a visitor.
     *
     * Priority: explicit "lang" query param → saved preference cookie →
     * browser/device language (Accept-Language) → the locale the entity was
     * created with (first supported).
     *
     * @param  array<int, string>  $supported
     */
    public static function resolve(Request $request, array $supported): string
    {
        if ($supported === []) {
            return config('app.locale', 'en');
        }

        $explicit = $request->query('lang');

        if (is_string($explicit) && in_array($explicit, $supported, true)) {
            return $explicit;
        }

        $preferred = $request->cookie('simplemenu_lang');

        if (is_string($preferred) && in_array($preferred, $supported, true)) {
            return $preferred;
        }

        foreach ($request->getLanguages() as $language) {
            $candidate = preg_replace('/[-_].*$/', '', $language);

            if (in_array($candidate, $supported, true)) {
                return $candidate;
            }
        }

        return $supported[0];
    }
}
