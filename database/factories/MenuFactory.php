<?php

namespace Database\Factories;

use App\Models\Menu;
use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Menu>
 */
class MenuFactory extends Factory
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
            'slug' => 'menu-'.fake()->unique()->numerify('########'),
            'name' => fake()->word(),
            'currency' => 'EGP',
            'languages' => ['en'],
        ];
    }

    /**
     * Attach categories with the given items.
     */
    public function withCategories(int $categoryCount = 2, int $itemCount = 3): static
    {
        return $this->has(MenuCategory::factory()->count($categoryCount)->has(MenuItem::factory()->count($itemCount)), 'categories');
    }
}
