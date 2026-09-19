<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::guard('web')->user();

        $restaurants = $user->restaurants()
            ->with(['translations', 'menus'])
            ->latest()
            ->get()
            ->map(function ($restaurant) {
                return [
                    'id' => $restaurant->id,
                    'slug' => $restaurant->slug,
                    'name' => $restaurant->translation()->name,
                    'logo' => $restaurant->logo ? asset('storage/'.$restaurant->logo) : null,
                    'profile_url' => route('public.restaurant', $restaurant->slug),
                    'menus' => $restaurant->menus->map(fn ($menu) => [
                        'id' => $menu->id,
                        'slug' => $menu->slug,
                        'name' => $menu->name,
                        'currency' => $menu->currency,
                        'menu_url' => route('public.menu', $menu->slug),
                    ])->values(),
                ];
            });

        return Inertia::render('Dashboard/Index', [
            'restaurants' => $restaurants,
        ]);
    }
}
