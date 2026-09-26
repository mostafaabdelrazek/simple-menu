<?php

use Illuminate\Support\Facades\Vite;

/**
 * Resolve an asset URL.
 *
 * In production the document root on the host is the project root (shared
 * hosting), so built assets live under /public instead of /build. This mirrors
 * the custom_asset() helper used by the mitsike project.
 */
function custom_asset(string $path, ?bool $secure = null): string
{
    if (app()->environment('production') && ! Vite::isRunningHot()) {
        $path = 'public/'.$path;
    }

    $url = asset($path, $secure);

    if (Vite::isRunningHot()) {
        return $url;
    }

    $version = config('app.asset_version');

    if ($version === null) {
        return $url;
    }

    // The version must stay free of dots: Vite::isCssPath() only matches a
    // query string that contains none, and a dotted version makes Laravel tag
    // the stylesheet as a module script, which browsers then refuse to load.
    $version = preg_replace('/[^A-Za-z0-9_-]/', '', (string) $version);

    if ($version === '') {
        return $url;
    }

    return $url.(str_contains($url, '?') ? '&' : '?').'v='.$version;
}
