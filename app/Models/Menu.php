<?php

namespace App\Models;

use Database\Factories\MenuFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['restaurant_id', 'slug', 'name', 'currency', 'languages', 'theme_background', 'theme_primary', 'theme_font'])]
class Menu extends Model
{
    /** @use HasFactory<MenuFactory> */
    use HasFactory;

    /**
     * Font families a menu can be rendered with.
     *
     * @var array<int, string>
     */
    public const THEME_FONTS = ['sans', 'serif', 'system', 'mono'];

    /**
     * The look a menu falls back to when the owner picked nothing.
     *
     * @var array{background: string, primary: string, font: string}
     */
    public const DEFAULT_THEME = [
        'background' => '#0c0a09',
        'primary' => '#f5f5f4',
        'font' => 'sans',
    ];

    /**
     * The resolved theme for the public pages, with defaults filled in.
     *
     * @return array{background: string, primary: string, font: string}
     */
    public function theme(): array
    {
        return [
            'background' => $this->theme_background ?: self::DEFAULT_THEME['background'],
            'primary' => $this->theme_primary ?: self::DEFAULT_THEME['primary'],
            'font' => in_array($this->theme_font, self::THEME_FONTS, true)
                ? $this->theme_font
                : self::DEFAULT_THEME['font'],
        ];
    }

    /**
     * @return BelongsTo<Restaurant, $this>
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * @return HasMany<MenuCategory, $this>
     */
    public function categories(): HasMany
    {
        return $this->hasMany(MenuCategory::class)->orderBy('sort_order');
    }

    public function hasLanguage(string $locale): bool
    {
        return in_array($locale, $this->languages, true);
    }

    protected function casts(): array
    {
        return [
            'languages' => 'array',
        ];
    }
}
