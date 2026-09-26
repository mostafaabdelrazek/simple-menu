<?php

namespace App\Http\Middleware;

use App\Support\Translations;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'csrf_token' => csrf_token(),
            'app' => [
                'name' => config('app.name'),
            ],
            'locale' => app()->getLocale(),
            'translations' => Translations::for(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'auth' => [
                'user' => $request->user('web')?->only('id', 'name', 'email', 'avatar', 'country_code', 'phone'),
                'admin' => $request->user('admin')?->only('id', 'name', 'email'),
            ],
        ];
    }
}
