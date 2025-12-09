<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    /**
     * Obter eventos do calendário
     */
    public function events(Request $request): JsonResponse
    {
        $start = $request->input('start', Carbon::now()->startOfMonth());
        $end = $request->input('end', Carbon::now()->endOfMonth());

        $bookings = Booking::with(['customer', 'service', 'user', 'professional'])
            ->where('tenant_id', auth()->user()->tenant_id)
            ->whereBetween('start_time', [
                Carbon::parse($start),
                Carbon::parse($end),
            ])
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'title' => $booking->customer->name.' - '.$booking->service->name,
                    'start' => $booking->start_time->toIso8601String(),
                    'end' => $booking->end_time->toIso8601String(),
                    'color' => $booking->service->color ?? '#3b82f6',
                    'status' => $booking->status,
                    'customer' => $booking->customer->name,
                    'service' => $booking->service->name,
                    'notes' => $booking->notes,
                ];
            });

        return response()->json($bookings);
    }

    /**
     * Verificar disponibilidade
     */
    public function availability(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'service_id' => 'required|exists:services,id',
            'duration' => 'nullable|integer',
        ]);

        $date = Carbon::parse($request->date);
        $service = \App\Models\Service::findOrFail($request->service_id);
        $duration = $request->duration ?? $service->duration;

        // Horários de trabalho padrão (9h às 18h)
        $workStart = $date->copy()->setTime(9, 0);
        $workEnd = $date->copy()->setTime(18, 0);

        // Buscar agendamentos existentes
        $existingBookings = Booking::where('tenant_id', auth()->user()->tenant_id)
            ->whereDate('start_time', $date)
            ->where('status', '!=', Booking::STATUS_CANCELLED)
            ->when($request->professional_id, fn ($q) => $q->where('professional_id', $request->professional_id))
            ->get();

        $availableSlots = [];
        $current = $workStart->copy();

        while ($current->copy()->addMinutes($duration)->lte($workEnd)) {
            $slotEnd = $current->copy()->addMinutes($duration);

            // Verificar se há conflito
            $hasConflict = $existingBookings->contains(function ($booking) use ($current, $slotEnd) {
                return $current->lt($booking->end_time) && $slotEnd->gt($booking->start_time);
            });

            if (! $hasConflict) {
                $availableSlots[] = [
                    'start' => $current->copy()->format('H:i'),
                    'end' => $slotEnd->format('H:i'),
                ];
            }

            $current->addMinutes(15); // Intervalo de 15 minutos
        }

        return response()->json([
            'date' => $date->format('Y-m-d'),
            'available_slots' => $availableSlots,
        ]);
    }
}
