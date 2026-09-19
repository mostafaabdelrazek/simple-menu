<?php

namespace Database\Factories;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuItem>
 */
class MenuItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $price = fake()->randomFloat(2, 5, 100);

        return [
            'menu_category_id' => MenuCategory::factory(),
            'price' => $price,
            'discount_price' => fake()->boolean(30) ? round($price * fake()->randomFloat(2, 0.5, 0.9), 2) : null,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
