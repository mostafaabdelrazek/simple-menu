<?php

namespace App\Services\Otp;

interface OtpSender
{
    public function send(string $countryCode, string $phone, string $code): void;
}
