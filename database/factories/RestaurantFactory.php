<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Restaurant>
 */
class RestaurantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'slug' => Str::slug(fake()->unique()->company()),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'address' => fake()->address(),
            'banner' => null,
            'logo' => null,
            'social_links' => [],
        ];
    }

    /**
     * Attach translations for the given locales.
     */
    public function translated(array $locales = ['en']): static
    {
        return $this->has(RestaurantTranslation::factory()->count(count($locales))->sequence(
            ...array_map(fn ($locale) => ['locale' => $locale, 'name' => fake()->company()], $locales)
        ), 'translations');
    }
}
