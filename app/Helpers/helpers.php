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

    return $url.(str_contains($url, '?') ? '&' : '?').'v='.$version;
}
