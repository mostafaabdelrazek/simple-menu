<?php

use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MenuController as AdminMenuController;
use App\Http\Controllers\Admin\RestaurantController as AdminRestaurantController;
use App\Http\Controllers\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Auth\DemoLoginController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\PhoneVerificationController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Public\PublicMenuController;
use App\Http\Controllers\Public\PublicRestaurantController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\UploadController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', HomeController::class)->name('home');
Route::get('/pricing', [BillingController::class, 'pricing'])->name('pricing');
Route::get('/login', function () {
    $demoUsers = User::query()
        ->where('email', 'like', '%demo%')
        ->orWhere('email', 'like', '%@simplemenu.test')
        ->orderBy('name')
        ->get(['id', 'name', 'email'])
        ->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);

    return Inertia::render('Auth/Login', [
        'demo_login_available' => (bool) config('app.debug'),
        'demo_users' => $demoUsers,
    ]);
})->name('login');

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

// Paymob posts transaction callbacks to this endpoint directly (no session).
Route::post('/billing/paymob/webhook', [BillingController::class, 'webhook'])
    ->name('billing.paymob.webhook');

Route::middleware('auth')->get('/suspended', function () {
    $user = Auth::guard('web')->user();

    if ($user === null || ! $user->isSuspended()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Suspended');
})->name('suspended');

Route::middleware(['auth', 'ensure.not.suspended', 'ensure.phone.verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/restaurants/create', [RestaurantController::class, 'create'])->name('restaurants.create');
    Route::post('/restaurants', [RestaurantController::class, 'store'])->name('restaurants.store');
    Route::get('/restaurants/{restaurant:slug}/edit', [RestaurantController::class, 'edit'])->name('restaurants.edit');
    Route::put('/restaurants/{restaurant:slug}', [RestaurantController::class, 'update'])->name('restaurants.update');
    Route::get('/restaurants/{restaurant:slug}/complete', [RestaurantController::class, 'complete'])->name('restaurants.complete');
    Route::post('/uploads', [UploadController::class, 'store'])->name('uploads.store');
});

// Billing is reachable even when suspended so the owner can upgrade.
Route::middleware(['auth', 'ensure.phone.verified'])->group(function () {
    Route::get('/billing', [BillingController::class, 'index'])->name('billing');
    Route::post('/billing/checkout', [BillingController::class, 'checkout'])
        ->name('billing.checkout')
        ->middleware('throttle:5,1');
    Route::post('/billing/cancel', [BillingController::class, 'cancel'])
        ->name('billing.cancel')
        ->middleware('throttle:3,1');
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
        Route::get('/subscriptions', [AdminSubscriptionController::class, 'index'])->name('subscriptions');

        // Moderation: suspend/restore, and remove content that breaks the rules.
        Route::post('/restaurants/{restaurant}/suspend', [AdminRestaurantController::class, 'suspend'])->name('restaurants.suspend');
        Route::post('/restaurants/{restaurant}/restore', [AdminRestaurantController::class, 'restore'])->name('restaurants.restore');
        Route::delete('/restaurants/{restaurant}', [AdminRestaurantController::class, 'destroy'])->name('restaurants.destroy');
        Route::delete('/menus/{menu}', [AdminMenuController::class, 'destroy'])->name('menus.destroy');
        Route::post('/users/{user}/suspend', [AdminUserController::class, 'suspend'])->name('users.suspend');
        Route::post('/users/{user}/restore', [AdminUserController::class, 'restore'])->name('users.restore');
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

        // Billing administration: grant (or cancel) subscriptions by hand.
        Route::post('/subscriptions', [AdminSubscriptionController::class, 'grant'])->name('subscriptions.grant');
        Route::post('/subscriptions/{subscription}/cancel', [AdminSubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
    });
});
