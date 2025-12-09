<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BookingService
{
    /**
     * Criar agendamento
     */
    public function create(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $service = Service::findOrFail($data['service_id']);
            $startTime = Carbon::parse($data['start_time']);
            $endTime = $startTime->copy()->addMinutes($service->duration);

            // Obter tenant_id (do usuário autenticado ou do array de dados)
            $tenantId = $data['tenant_id'] ?? (auth()->check() ? auth()->user()->tenant_id : null);

            if (! $tenantId) {
                throw new \Exception('Tenant não identificado.');
            }

            // Verificar conflitos
            $this->checkConflicts(
                $startTime,
                $endTime,
                $data['professional_id'] ?? null,
                $data['user_id'] ?? null,
                null,
                $tenantId
            );

            $booking = Booking::create([
                'tenant_id' => $tenantId,
                'customer_id' => $data['customer_id'],
                'service_id' => $data['service_id'],
                'professional_id' => $data['professional_id'] ?? null,
                'user_id' => $data['user_id'] ?? (auth()->check() ? auth()->id() : null),
                'start_time' => $startTime,
                'end_time' => $endTime,
                'status' => Booking::STATUS_PENDING,
                'notes' => $data['notes'] ?? null,
                'price' => $service->price,
            ]);

            // Disparar notificação (será implementado depois)
            // event(new BookingCreated($booking));

            return $booking;
        });
    }

    /**
     * Atualizar agendamento
     */
    public function update(Booking $booking, array $data): Booking
    {
        return DB::transaction(function () use ($booking, $data) {
            $startTime = isset($data['start_time'])
                ? Carbon::parse($data['start_time'])
                : $booking->start_time;

            $service = $booking->service;
            if (isset($data['service_id'])) {
                $service = Service::findOrFail($data['service_id']);
            }

            $endTime = $startTime->copy()->addMinutes($service->duration);

            // Verificar conflitos (excluindo o próprio agendamento)
            $this->checkConflicts(
                $startTime,
                $endTime,
                $data['professional_id'] ?? $booking->professional_id,
                $data['user_id'] ?? $booking->user_id,
                $booking->id
            );

            $booking->update(array_merge($data, [
                'end_time' => $endTime,
                'price' => $service->price,
            ]));

            return $booking->fresh();
        });
    }

    /**
     * Verificar conflitos de horário
     */
    protected function checkConflicts(
        Carbon $startTime,
        Carbon $endTime,
        ?int $professionalId = null,
        ?int $userId = null,
        ?int $excludeBookingId = null,
        ?int $tenantId = null
    ): void
    {
        $tenantId = $tenantId ?? (auth()->check() ? auth()->user()->tenant_id : null);

        if (! $tenantId) {
            throw new \Exception('Tenant não identificado.');
        }

        $query = Booking::where('tenant_id', $tenantId)
            ->where('status', '!=', Booking::STATUS_CANCELLED)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime])
                    ->orWhere(function ($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                    });
            });

        // Prioriza conflito por profissional; se não informar, cai no usuário (legacy)
        if ($professionalId) {
            $query->where('professional_id', $professionalId);
        } elseif ($userId) {
            $query->where('user_id', $userId);
        }

        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        if ($query->exists()) {
            throw new \Exception('Já existe um agendamento neste horário.');
        }
    }
}
