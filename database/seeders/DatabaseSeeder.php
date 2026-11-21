<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        Admin::query()->firstOrCreate(
            ['email' => 'admin@simplemenu.test'],
            [
                'name' => 'Super Admin',
                'password' => 'password',
                'remember_token' => Str::random(10),
            ],
        );

        User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Str::random(32),
            ],
        );

        $demo = User::query()->firstOrCreate(
            ['email' => 'demo@simplemenu.test'],
            [
                'name' => 'Demo User',
                'country_code' => '+20',
                'phone' => '1001234567',
                'phone_verified_at' => now(),
            ],
        );

        $this->call(DemoRestaurantSeeder::class);

        // The demo account showcases the paid tier: Pro for a year, granted by
        // hand — the same thing an admin does from /admin/subscriptions.
        if ($demo->subscriptions()->exists() === false) {
            $demo->subscriptions()->create([
                'plan' => 'pro',
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => now()->addYear(),
                'gateway' => 'manual',
                'gateway_order_id' => 'seed-'.$demo->id,
            ]);
        }

        // Five additional demo accounts for testing different billing / plan
        // states. All have verified phones so they can log in directly.
        $demoUsers = [
            ['email' => 'demo1@simplemenu.test', 'name' => 'Demo User One', 'country_code' => '+20', 'phone' => '1001111111'],
            ['email' => 'demo2@simplemenu.test', 'name' => 'Demo User Two', 'country_code' => '+33', 'phone' => '1002222222'],
            ['email' => 'demo3@simplemenu.test', 'name' => 'Demo User Three', 'country_code' => '+213', 'phone' => '1003333333'],
            ['email' => 'demo4@simplemenu.test', 'name' => 'Demo User Four', 'country_code' => '+1', 'phone' => '1004444444'],
            ['email' => 'demo5@simplemenu.test', 'name' => 'Demo User Five', 'country_code' => '+966', 'phone' => '1005555555'],
        ];

        foreach ($demoUsers as $spec) {
            User::query()->firstOrCreate(
                ['email' => $spec['email']],
                [
                    'name' => $spec['name'],
                    'country_code' => $spec['country_code'],
                    'phone' => $spec['phone'],
                    'phone_verified_at' => now(),
                ],
            );
        }
    }
}
