<?php

namespace Database\Factories;

use App\Models\MenuCategory;
use App\Models\MenuCategoryTranslation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuCategoryTranslation>
 */
class MenuCategoryTranslationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'menu_category_id' => MenuCategory::factory(),
            'locale' => 'en',
            'name' => fake()->word(),
        ];
    }
}
