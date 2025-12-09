<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained()->onDelete('cascade');
            $table->string('name')->default('default');
            $table->string('primary_color')->default('#3b82f6');
            $table->string('secondary_color')->default('#8b5cf6');
            $table->string('accent_color')->default('#10b981');
            $table->string('background_color')->default('#ffffff');
            $table->string('text_color')->default('#1f2937');
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();
            $table->text('custom_css')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('themes');
    }
};
