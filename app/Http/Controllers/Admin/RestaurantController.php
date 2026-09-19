<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantController extends Controller
{
    public function index(Request $request): Response
    {
        $restaurants = Restaurant::query()
            ->with(['translations', 'owner'])
            ->when($request->string('search')->toString(), fn ($query, $search) => $query
                ->whereHas('translations', fn ($q) => $q->where('name', 'like', "%{$search}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Restaurant $restaurant) => [
                'id' => $restaurant->id,
                'slug' => $restaurant->slug,
                'name' => $restaurant->translation()?->name,
                'owner' => $restaurant->owner?->name,
                'created_at' => $restaurant->created_at?->toDateTimeString(),
                'url' => route('public.restaurant', $restaurant->slug),
            ]);

        return Inertia::render('Admin/Restaurants', [
            'restaurants' => $restaurants,
        ]);
    }
}
