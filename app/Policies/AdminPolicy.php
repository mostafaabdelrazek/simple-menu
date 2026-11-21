<?php

namespace App\Policies;

use App\Models\Admin;

class AdminPolicy
{
    /**
     * Determine whether the admin can manage restaurants.
     */
    public function manageRestaurants(Admin $admin): bool
    {
        return true;
    }

    /**
     * Determine whether the admin can manage users.
     */
    public function manageUsers(Admin $admin): bool
    {
        return true;
    }

    /**
     * Determine whether the admin can manage menus.
     */
    public function manageMenus(Admin $admin): bool
    {
        return true;
    }

    /**
     * Determine whether the admin can manage subscriptions.
     */
    public function manageSubscriptions(Admin $admin): bool
    {
        return true;
    }

    /**
     * Prevent admins from deleting themselves.
     */
    public function delete(Admin $admin, $model): bool
    {
        if ($model instanceof Admin && $model->id === $admin->id) {
            return false;
        }

        return true;
    }
}
