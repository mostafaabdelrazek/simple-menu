<?php

namespace Database\Factories;

use App\Models\MenuItem;
use App\Models\MenuItemTranslation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuItemTranslation>
 */
class MenuItemTranslationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'menu_item_id' => MenuItem::factory(),
            'locale' => 'en',
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
        ];
    }
}
