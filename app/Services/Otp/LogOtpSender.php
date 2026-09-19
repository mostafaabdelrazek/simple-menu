<?php

namespace App\Services\Otp;

use Illuminate\Support\Facades\Log;

class LogOtpSender implements OtpSender
{
    public function send(string $countryCode, string $phone, string $code): void
    {
        Log::info("OTP sent to {$countryCode}{$phone}: {$code}");
    }
}
