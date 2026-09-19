<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\RestaurantTranslation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RestaurantTranslation>
 */
class RestaurantTranslationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'locale' => 'en',
            'name' => fake()->company(),
            'description' => fake()->paragraph(),
        ];
    }
}
