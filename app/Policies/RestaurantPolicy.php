<?php

namespace App\Policies;

use App\Models\Restaurant;
use App\Models\User;

class RestaurantPolicy
{
    public function view(User $user, Restaurant $restaurant): bool
    {
        return $restaurant->isOwnedBy($user);
    }

    public function update(User $user, Restaurant $restaurant): bool
    {
        return $restaurant->isOwnedBy($user);
    }
}
