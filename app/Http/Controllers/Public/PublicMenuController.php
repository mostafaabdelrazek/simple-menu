<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Support\LocaleResolver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicMenuController extends Controller
{
    public function show(Request $request, Menu $menu): Response
    {
        $menu->load(['restaurant.translations', 'categories.items.translations', 'categories.translations']);

        $locale = LocaleResolver::resolve($request, $menu->languages);

        $categories = $menu->categories
            ->filter(fn ($category) => $category->translation($locale) !== null)
            ->map(function ($category) use ($locale) {
                return [
                    'name' => optional($category->translation($locale))->name,
                    'items' => $category->items->map(function ($item) use ($locale) {
                        $translation = $item->translation($locale);

                        return [
                            'name' => optional($translation)->name,
                            'description' => optional($translation)->description,
                            'price' => $item->price,
                            'discount_price' => $item->discount_price,
                            'image' => $item->image !== null ? custom_asset('storage/'.$item->image) : null,
                        ];
                    })->values(),
                ];
            })->values();

        return Inertia::render('Public/Menu', [
            'locale' => $locale,
            // The menu content falls back to a language it actually has, but the
            // interface around it follows the visitor's own language so a
            // French reader never gets a right-to-left French page.
            'ui_locale' => app()->getLocale(),
            'languages' => $menu->languages,
            'theme' => $menu->theme(),
            'restaurant' => [
                'name' => $menu->restaurant->translation($locale)->name,
                'url' => route('public.restaurant', $menu->restaurant->slug),
            ],
            'menu' => [
                'name' => $menu->name,
                'currency' => $menu->currency,
                'categories' => $categories,
            ],
        ]);
    }
}
