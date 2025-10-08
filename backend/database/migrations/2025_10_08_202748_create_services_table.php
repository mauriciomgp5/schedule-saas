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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2); // Preço do serviço
            $table->integer('duration'); // Duração em minutos
            $table->string('image')->nullable(); // Imagem do serviço
            $table->boolean('is_active')->default(true);
            $table->boolean('requires_approval')->default(false); // Se precisa aprovação do dono
            $table->integer('max_bookings_per_slot')->default(1); // Quantas pessoas podem agendar no mesmo horário
            $table->integer('buffer_time')->default(0); // Tempo de buffer entre agendamentos (minutos)
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
