<?php

namespace App\Services\Otp;

use Illuminate\Support\Carbon;

class OtpService
{
    public function __construct(
        private readonly OtpSender $sender,
        private readonly int $ttlMinutes,
        private readonly int $digits,
    ) {}

    public function generate(): string
    {
        return (string) random_int(10 ** ($this->digits - 1), (10 ** $this->digits) - 1);
    }

    public function expiresAt(): Carbon
    {
        return now()->addMinutes($this->ttlMinutes);
    }

    public function send(string $countryCode, string $phone, string $code): void
    {
        $this->sender->send($countryCode, $phone, $code);
    }
}
