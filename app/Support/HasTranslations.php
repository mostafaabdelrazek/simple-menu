<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;

trait HasTranslations
{
    /**
     * Resolve the translation for the given locale, falling back to the first available.
     *
     * @template TTranslate of Model
     *
     * @return TTranslate|null
     */
    public function translation(?string $locale = null): ?Model
    {
        /** @var TTranslate|null */
        return $this->translations->first(
            fn ($translation) => $translation->locale === ($locale ?? app()->getLocale())
        ) ?? $this->translations->first();
    }

    /**
     * The locales this entity is available in.
     *
     * @return array<int, string>
     */
    public function availableLocales(): array
    {
        return $this->translations->pluck('locale')->values()->all();
    }
}
