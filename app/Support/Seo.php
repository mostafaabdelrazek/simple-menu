<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Server-rendered meta tags for the Blade shell.
 *
 * The app is an Inertia SPA without SSR, so the React-only <Head> never
 * reaches the initial HTML for the pages QR codes point at. The public and
 * landing controllers share meta details here instead; `app.blade.php`
 * renders them into the real head so share previews and search bots see the
 * restaurant's own title, description and Open Graph image right away.
 */
final class Seo
{
    /**
     * @param  array<string, mixed>  $attributes  optional: image, type, no_index, jsonld (array each)
     */
    public static function share(Request $request, string $title, string $description, array $attributes = []): void
    {
        view()->share('seo', [
            'site_name' => config('app.name', 'SimpleMenu'),
            'title' => $title,
            'description' => $description,
            'url' => $request->url(),
            'image' => $attributes['image'] ?? null,
            'type' => $attributes['type'] ?? 'website',
            'locale' => str_replace('_', '-', app()->getLocale()),
            'no_index' => (bool) ($attributes['no_index'] ?? false),
            'jsonld' => $attributes['jsonld'] ?? null,
        ]);
    }
}
