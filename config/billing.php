<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Billing Driver
    |--------------------------------------------------------------------------
    |
    | "none" runs the app without a payment gateway: new subscriptions are
    | started as trials instead of going through a checkout, and admins can
    | grant or cancel subscriptions manually from the admin panel.
    |
    | "paymob" sends upgrade requests to Paymob (https://paymob.com) and
    | activates the subscription from the HMAC-verified webhook.
    |
    */

    'driver' => env('BILLING_DRIVER', 'none'),

    // Currency every plan price is charged in, e.g. EGP.
    'currency' => env('BILLING_CURRENCY', 'EGP'),

    /*
    |--------------------------------------------------------------------------
    | Plans
    |--------------------------------------------------------------------------
    |
    | Plans and their limits live in config so they can be displayed on the
    | pricing page without a database round trip. `restaurants` is the maximum
    | number of restaurants an account on the plan can manage (null = no
    | limit) and `branding` marks whether the "Powered by SimpleMenu" footer
    | is shown on the public pages.
    |
    */

    'plans' => [
        'free' => [
            'name' => 'Free',
            'price' => 0,
            'billing_period' => null,
            'limits' => [
                'restaurants' => 1,
                'items_per_menu' => 20,
            ],
            'features' => ['branding' => true],
            'highlights' => [
                '1 restaurant',
                '1 menu per restaurant',
                '20 items per menu',
                'Arabic, English & French',
                'QR code downloads & printable table cards',
                'SimpleMenu branding on public pages',
            ],
        ],

        'pro' => [
            'name' => 'Pro',
            'price' => 199,
            'billing_period' => 'month',
            'limits' => [
                'restaurants' => 3,
                'items_per_menu' => null,
            ],
            'features' => ['branding' => false],
            'highlights' => [
                '3 restaurants',
                '1 menu per restaurant',
                'Unlimited items',
                'Arabic, English & French',
                'QR code downloads & printable table cards',
                'No SimpleMenu branding on public pages',
                'Priority support',
            ],
        ],
    ],

    // The plan every account is on when it has no active subscription.
    'default_plan' => 'free',

    // Length (in days) of the Pro trial granted when no gateway is configured
    // and of Paymob subscriptions' first invoice period.
    'trial_days' => (int) env('BILLING_TRIAL_DAYS', 14),

    /*
    |--------------------------------------------------------------------------
    | Public Page Cache
    |--------------------------------------------------------------------------
    |
    | The public restaurant and menu pages are the hot path (every QR scan
    | hits them), so the rendered page props are cached in the application
    | cache. Any write through the wizard, the admin moderation tools or the
    | webhooks invalidates the exact entity that changed.
    |
    */

    'public_cache' => [
        'enabled' => (bool) env('PUBLIC_CACHE_ENABLED', true),
        'ttl' => (int) env('PUBLIC_CACHE_TTL', 3600),
    ],

    /*
    |--------------------------------------------------------------------------
    | Paymob Accept
    |--------------------------------------------------------------------------
    |
    | Credentials from your Paymob dashboard (Developers → API keys, and the
    | online card integration + iframe IDs). The webhook secret is the HMAC
    | secret used to verify transaction callbacks.
    |
    */

    'paymob' => [
        'base_url' => env('PAYMOB_BASE_URL', 'https://accept.paymob.com/api'),
        'api_key' => env('PAYMOB_API_KEY'),
        'iframe_id' => env('PAYMOB_IFRAME_ID'),
        'integration_id' => env('PAYMOB_INTEGRATION_ID'),
        'hmac_secret' => env('PAYMOB_HMAC_SECRET'),
    ],
];
