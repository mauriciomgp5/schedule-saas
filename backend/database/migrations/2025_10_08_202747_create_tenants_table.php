<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nome da loja/empresa
            $table->string('slug')->unique(); // URL amigável (ex: salao-beleza)
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->text('description')->nullable();
            $table->string('logo')->nullable(); // URL do logo
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('country')->default('BR');
            $table->boolean('is_active')->default(true);
            $table->timestamp('trial_ends_at')->nullable(); // Para trial do SaaS
            $table->string('subscription_plan')->nullable(); // free, basic, premium
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
