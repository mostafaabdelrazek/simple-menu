<?php

namespace App\Support;

class Translations
{
    /**
     * @var array<string, array<string, string>>
     */
    private static array $cache = [];

    /**
     * The interface strings for a locale, ready to hand to Inertia.
     *
     * @return array<string, string>
     */
    public static function for(?string $locale = null): array
    {
        $locale ??= app()->getLocale();

        if (isset(self::$cache[$locale])) {
            return self::$cache[$locale];
        }

        $path = lang_path("{$locale}.json");

        if (! is_file($path)) {
            return self::$cache[$locale] = [];
        }

        $decoded = json_decode((string) file_get_contents($path), true);

        return self::$cache[$locale] = is_array($decoded) ? $decoded : [];
    }
}
