<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        @isset($seo)
            <title inertia>{{ $seo['title'] }} · {{ $seo['site_name'] }}</title>
            <meta name="description" content="{{ $seo['description'] }}">
            @if ($seo['no_index'])
                <meta name="robots" content="noindex">
            @endif
            <link rel="canonical" href="{{ $seo['url'] }}">
            <meta property="og:type" content="{{ $seo['type'] }}">
            <meta property="og:site_name" content="{{ $seo['site_name'] }}">
            <meta property="og:title" content="{{ $seo['title'] }}">
            <meta property="og:description" content="{{ $seo['description'] }}">
            <meta property="og:url" content="{{ $seo['url'] }}">
            <meta property="og:locale" content="{{ $seo['locale'] }}">
            @if ($seo['image'])
                <meta property="og:image" content="{{ $seo['image'] }}">
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:title" content="{{ $seo['title'] }}">
                <meta name="twitter:description" content="{{ $seo['description'] }}">
                <meta name="twitter:image" content="{{ $seo['image'] }}">
            @endif
            @foreach ((array) ($seo['jsonld'] ?? []) as $jsonld)
                <script type="application/ld+json">{!! json_encode($jsonld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
            @endforeach
        @else
            <title inertia>{{ config('app.name', 'SimpleMenu') }}</title>
        @endisset
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-stone-50 text-stone-900">
        @inertia
    </body>
</html>
