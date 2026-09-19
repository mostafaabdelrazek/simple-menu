<?php

namespace App\Models;

use Database\Factories\PhoneVerificationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'country_code', 'phone', 'otp_hash', 'expires_at', 'verified_at', 'attempts'])]
class PhoneVerification extends Model
{
    /** @use HasFactory<PhoneVerificationFactory> */
    use HasFactory;

    public const MAX_ATTEMPTS = 5;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function matches(string $otp): bool
    {
        return ! $this->isVerified() && ! $this->isExpired() && password_verify($otp, $this->otp_hash);
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isLocked(): bool
    {
        return $this->attempts >= self::MAX_ATTEMPTS;
    }

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }
}
