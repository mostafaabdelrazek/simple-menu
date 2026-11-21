<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = ['user_id', 'plan', 'status', 'current_period_start', 'current_period_end', 'trial_ends_at', 'canceled_at', 'gateway', 'gateway_order_id', 'gateway_transaction_id'];

    public const STATUS_PENDING = 'pending';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_CANCELED = 'canceled';

    public const STATUS_TRIAL = 'trialing';

    protected function casts(): array
    {
        return [
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'trial_ends_at' => 'datetime',
            'canceled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at !== null && $this->trial_ends_at->isFuture();
    }

    public function isActive(): bool
    {
        if ($this->status === self::STATUS_ACTIVE) {
            return $this->current_period_end === null || $this->current_period_end->isFuture();
        }

        return $this->status === self::STATUS_TRIAL && $this->isOnTrial();
    }

    public function markActivated(?CarbonImmutable $periodEnd = null, ?int $days = null): void
    {
        $this->forceFill([
            'status' => self::STATUS_ACTIVE,
            'trial_ends_at' => null,
            'canceled_at' => null,
            'current_period_start' => now(),
            'current_period_end' => $periodEnd ?? ($days !== null ? now()->addDays($days) : null),
        ])->save();
    }

    public function markCanceled(): void
    {
        $this->forceFill([
            'status' => self::STATUS_CANCELED,
            'canceled_at' => now(),
        ])->save();
    }
}
