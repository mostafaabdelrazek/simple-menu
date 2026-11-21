<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks suspended owners from every signed-in page; the admin panel restores
 * their access by lifting the suspension.
 */
class EnsureUserNotSuspended
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('web')->user();

        if ($user !== null && $user->isSuspended()) {
            return redirect()->route('suspended');
        }

        return $next($request);
    }
}
