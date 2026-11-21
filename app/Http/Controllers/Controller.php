<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;

abstract class Controller
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Ensure the current request is authenticated via the admin guard.
     *
     * Admin routes are protected by the `auth:admin` middleware, so this is
     * a defense-in-depth check plus a place to add admin-specific rules
     * (e.g. preventing self-deletion).
     */
    protected function authorizeAdmin(): void
    {
        abort_unless(auth('admin')->user(), 403, 'Admin access required.');
    }
}
