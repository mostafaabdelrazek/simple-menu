<?php

namespace App\Models;

use Database\Factories\RestaurantTranslationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['restaurant_id', 'locale', 'name', 'description'])]
class RestaurantTranslation extends Model
{
    /** @use HasFactory<RestaurantTranslationFactory> */
    use HasFactory;

    public $timestamps = false;

    /**
     * @return BelongsTo<Restaurant, $this>
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }
}
