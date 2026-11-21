<?php

namespace App\Policies;

use App\Models\Menu;
use App\Models\User;

class MenuPolicy
{
    public function update(User $user, Menu $menu): bool
    {
        return $menu->restaurant->isOwnedBy($user);
    }
}
