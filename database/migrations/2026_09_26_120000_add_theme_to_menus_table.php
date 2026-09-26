<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table): void {
            $table->string('theme_background', 7)->nullable();
            $table->string('theme_primary', 7)->nullable();
            $table->string('theme_font', 20)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table): void {
            $table->dropColumn(['theme_background', 'theme_primary', 'theme_font']);
        });
    }
};
