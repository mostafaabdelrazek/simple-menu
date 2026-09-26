<?php

use Illuminate\Support\Facades\Vite;

/**
 * Resolve an asset URL.
 *
 * In production the document root on the host is the project root (shared
 * hosting), so every asset lives under /public instead of at the root. A
 * version query param is appended for cache busting.
 */
function custom_asset(string $path, ?bool $secure = null): string
{
    if (app()->environment('production')) {
        $path = 'public/'.$path;
    }

    $url = asset($path, $secure);

    // While the Vite dev server is running, paths point at the dev server and
    // must stay byte-for-byte identical or module resolution breaks.
    if (Vite::isRunningHot()) {
        return $url;
    }

    $version = config('app.version', '1.0.0');

    // The version must stay free of dots: Vite::isCssPath() only matches a
    // query string that contains none, and a dotted version makes Laravel tag
    // the stylesheet as a module script, which browsers then refuse to load.
    $version = preg_replace('/[^A-Za-z0-9_-]/', '', (string) $version);

    if ($version === '') {
        return $url;
    }

    // Append version query param for cache busting
    if (str_contains($url, '?')) {
        return $url.'&v='.$version;
    }

    return $url.'?v='.$version;
}
