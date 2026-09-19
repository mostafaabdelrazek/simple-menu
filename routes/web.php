<?php

use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MenuController as AdminMenuController;
use App\Http\Controllers\Admin\RestaurantController as AdminRestaurantController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Auth\DemoLoginController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\PhoneVerificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Public\PublicMenuController;
use App\Http\Controllers\Public\PublicRestaurantController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\UploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', HomeController::class)->name('home');
Route::get('/login', fn () => Inertia::render('Auth/Login', [
    'demo_login_available' => (bool) config('app.debug'),
]))->name('login');

Route::get('/r/{restaurant:slug}', [PublicRestaurantController::class, 'show'])->name('public.restaurant');
Route::get('/m/{menu:slug}', [PublicMenuController::class, 'show'])->name('public.menu');

Route::middleware('guest')->group(function () {
    Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('auth.google');
    Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');
    Route::post('/demo-login', DemoLoginController::class)->name('demo.login');
});

Route::middleware('auth')->group(function () {
    Route::get('/onboarding/phone', [PhoneVerificationController::class, 'show'])->name('onboarding.phone');
    Route::post('/onboarding/phone', [PhoneVerificationController::class, 'send'])->name('onboarding.phone.send');
    Route::get('/onboarding/phone/verify', [PhoneVerificationController::class, 'showVerify'])->name('onboarding.verify');
    Route::post('/onboarding/phone/verify', [PhoneVerificationController::class, 'verify'])->name('onboarding.verify.post');
});

Route::middleware(['auth', 'ensure.phone.verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/restaurants/create', [RestaurantController::class, 'create'])->name('restaurants.create');
    Route::post('/restaurants', [RestaurantController::class, 'store'])->name('restaurants.store');
    Route::get('/restaurants/{restaurant:slug}/edit', [RestaurantController::class, 'edit'])->name('restaurants.edit');
    Route::put('/restaurants/{restaurant:slug}', [RestaurantController::class, 'update'])->name('restaurants.update');
    Route::get('/restaurants/{restaurant:slug}/complete', [RestaurantController::class, 'complete'])->name('restaurants.complete');
    Route::post('/uploads', [UploadController::class, 'store'])->name('uploads.store');
});

Route::middleware('auth')->post('/logout', function (Request $request) {
    Auth::guard('web')->logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect()->route('home');
})->name('logout');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest:admin')->group(function () {
        Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [AdminAuthController::class, 'login'])->name('login.post');
    });

    Route::middleware('auth:admin')->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
        Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/users', [AdminUserController::class, 'index'])->name('users');
        Route::get('/restaurants', [AdminRestaurantController::class, 'index'])->name('restaurants');
        Route::get('/menus', [AdminMenuController::class, 'index'])->name('menus');
    });
});
