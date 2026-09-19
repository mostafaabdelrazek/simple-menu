<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreRestaurantRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $restaurantLanguages = array_values(array_intersect(
            config('app.supported_locales', ['ar', 'en', 'fr']),
            $this->input('restaurant.languages', []),
        ));

        $menuLanguages = array_values(array_intersect($restaurantLanguages, $this->input('menu.languages', [])));

        return [
            'restaurant.languages' => ['required', 'array', 'min:1', 'max:3'],
            'restaurant.languages.*' => [Rule::in(['ar', 'en', 'fr'])],

            'restaurant.translations' => ['required', 'array'],
            'restaurant.translations.*.name' => ['required', 'string', 'max:255'],
            'restaurant.translations.*.description' => ['nullable', 'string', 'max:2000'],

            'restaurant.social_links' => ['nullable', 'array', 'max:20'],
            'restaurant.social_links.*.name' => ['required', 'string', 'max:100'],
            'restaurant.social_links.*.url' => ['required', 'url', 'max:500'],
            'restaurant.social_links.*.icon' => ['nullable', 'string', 'max:100'],

            'restaurant.latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'restaurant.longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'restaurant.maps_url' => ['nullable', 'url', 'max:500'],
            'restaurant.address' => ['nullable', 'string', 'max:500'],
            'restaurant.banner' => ['nullable', 'string', 'max:500'],
            'restaurant.logo' => ['nullable', 'string', 'max:500'],

            'menu.name' => ['nullable', 'string', 'max:255'],
            'menu.currency' => ['required', 'string', 'size:3', 'alpha'],
            'menu.languages' => ['required', 'array', 'min:1'],
            'menu.languages.*' => [Rule::in($restaurantLanguages)],

            'categories' => ['required', 'array', 'min:1', 'max:100'],
            'categories.*.translations' => ['required', 'array'],
            'categories.*.translations.*.name' => ['required', 'string', 'max:255'],

            'categories.*.items' => ['nullable', 'array', 'max:500'],
            'categories.*.items.*.price' => ['required', 'numeric', 'min:0'],
            'categories.*.items.*.discount_price' => ['nullable', 'numeric', 'min:0', 'lt:categories.*.items.*.price'],
            'categories.*.items.*.image' => ['nullable', 'string', 'max:500'],
            'categories.*.items.*.translations' => ['required', 'array'],
            'categories.*.items.*.translations.*.name' => ['required', 'string', 'max:255'],
            'categories.*.items.*.translations.*.description' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $restaurantLanguages = $this->input('restaurant.languages', []);
            $menuLanguages = $this->input('menu.languages', []);

            foreach (array_keys($this->input('restaurant.translations', [])) as $locale) {
                if (! in_array($locale, $restaurantLanguages, true)) {
                    $validator->errors()->add('restaurant.translations', "Translation locale '{$locale}' is not in the selected restaurant languages.");
                }
            }

            if (array_intersect($menuLanguages, $restaurantLanguages) !== $menuLanguages || $menuLanguages === []) {
                $validator->errors()->add('menu.languages', 'Menu languages must be a non-empty subset of the restaurant languages.');
            }

            foreach ($this->input('categories', []) as $index => $category) {
                foreach (array_keys($category['translations'] ?? []) as $locale) {
                    if (! in_array($locale, $menuLanguages, true)) {
                        $validator->errors()->add("categories.{$index}.translations", "Category translation locale '{$locale}' is not in the selected menu languages.");
                    }
                }

                foreach ($category['items'] ?? [] as $itemIndex => $item) {
                    foreach (array_keys($item['translations'] ?? []) as $locale) {
                        if (! in_array($locale, $menuLanguages, true)) {
                            $validator->errors()->add("categories.{$index}.items.{$itemIndex}.translations", "Item translation locale '{$locale}' is not in the selected menu languages.");
                        }
                    }
                }
            }
        });
    }
}
