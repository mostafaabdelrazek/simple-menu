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
        Admin::firstOrCreate(
            ['email' => 'admin@simplemenu.test'],
            [
                'name' => 'Super Admin',
                'password' => 'password',
                'remember_token' => Str::random(10),
            ],
        );

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Str::random(32),
            ],
        );

        User::firstOrCreate(
            ['email' => 'demo@simplemenu.test'],
            [
                'name' => 'Demo User',
                'country_code' => '+20',
                'phone' => '1001234567',
                'phone_verified_at' => now(),
            ],
        );
    }
}
