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
        Schema::create('tenant_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained()->onDelete('cascade');

            // Configurações de agendamento
            $table->integer('slot_duration')->default(30); // Duração padrão dos slots em minutos
            $table->integer('advance_booking_days')->default(30); // Quantos dias de antecedência pode agendar
            $table->integer('min_booking_notice')->default(60); // Mínimo de antecedência em minutos
            $table->integer('max_bookings_per_day')->nullable(); // Limite por cliente
            $table->boolean('auto_confirm_bookings')->default(false);
            $table->boolean('allow_cancellation')->default(true);
            $table->integer('cancellation_notice')->default(24); // Horas de antecedência para cancelar

            // Configurações de notificação
            $table->boolean('notify_new_booking')->default(true);
            $table->boolean('notify_cancellation')->default(true);
            $table->boolean('notify_reminder')->default(true);
            $table->integer('reminder_hours')->default(24); // Horas antes do agendamento

            // Configurações de aparência
            $table->string('primary_color')->default('#3B82F6');
            $table->string('secondary_color')->default('#10B981');
            $table->string('timezone')->default('America/Sao_Paulo');
            $table->string('locale')->default('pt_BR');
            $table->string('currency')->default('BRL');

            // Redes sociais
            $table->json('social_links')->nullable();

            // Configurações extras (JSON)
            $table->json('extra_settings')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_settings');
    }
};
