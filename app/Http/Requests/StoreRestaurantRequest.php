<?php

namespace App\Http\Requests;

use App\Models\Menu;
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

            'menu.theme' => ['nullable', 'array'],
            'menu.theme.background' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'menu.theme.primary' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'menu.theme.font' => ['nullable', Rule::in(Menu::THEME_FONTS)],

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

    /**
     * The messages a restaurant owner actually sees, translated.
     *
     * The framework's own validation strings stay in English until per-locale
     * validation files are published; these cover the rules this form owns.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'restaurant.languages.required' => __('validation.languages_required'),
            'restaurant.languages.min' => __('validation.languages_required'),
            'restaurant.translations.*.name.required' => __('validation.name_required', ['locale' => ':attribute']),
            'restaurant.translations.*.description.max' => __('validation.description_max'),
            'menu.currency.required' => __('validation.currency_required'),
            'menu.languages.min' => __('validation.menu_languages_subset'),
            'menu.theme.background.regex' => __('validation.background_color'),
            'menu.theme.primary.regex' => __('validation.text_color'),
            'menu.theme.font.in' => __('validation.font_family'),
            'categories.required' => __('validation.items_required'),
            'categories.min' => __('validation.items_required'),
            'categories.*.translations.*.name.required' => __('validation.category_name_required', ['locale' => ':attribute']),
            'categories.*.items.*.price.required' => __('validation.price_required'),
            'categories.*.items.*.price.numeric' => __('validation.price_required'),
            'categories.*.items.*.discount_price.lt' => __('validation.discount_price'),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $restaurantLanguages = $this->input('restaurant.languages', []);
            $menuLanguages = $this->input('menu.languages', []);

            foreach (array_keys($this->input('restaurant.translations', [])) as $locale) {
                if (! in_array($locale, $restaurantLanguages, true)) {
                    $validator->errors()->add('restaurant.translations', __('validation.translations_subset', ['locale' => $locale]));
                }
            }

            if (array_intersect($menuLanguages, $restaurantLanguages) !== $menuLanguages || $menuLanguages === []) {
                $validator->errors()->add('menu.languages', __('validation.menu_languages_subset'));
            }

            foreach ($this->input('categories', []) as $index => $category) {
                foreach (array_keys($category['translations'] ?? []) as $locale) {
                    if (! in_array($locale, $menuLanguages, true)) {
                        $validator->errors()->add("categories.{$index}.translations", __('validation.translations_subset', ['locale' => $locale]));
                    }
                }

                foreach ($category['items'] ?? [] as $itemIndex => $item) {
                    foreach (array_keys($item['translations'] ?? []) as $locale) {
                        if (! in_array($locale, $menuLanguages, true)) {
                            $validator->errors()->add("categories.{$index}.items.{$itemIndex}.translations", __('validation.translations_subset', ['locale' => $locale]));
                        }
                    }
                }
            }
        });
    }
}
