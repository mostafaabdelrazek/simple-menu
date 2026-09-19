<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Menu;
use App\Models\Restaurant;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'admins' => Admin::count(),
                'users' => User::count(),
                'restaurants' => Restaurant::count(),
                'menus' => Menu::count(),
            ],
        ]);
    }
}
