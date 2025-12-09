<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Professional;
use App\Models\Service;
use App\Models\Tenant;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Obter informações do tenant pelo domínio
     */
    public function getTenantByDomain(string $domain): JsonResponse
    {
        $tenant = Tenant::where('domain', $domain)
            ->where('is_active', true)
            ->with('theme')
            ->first();

        if (! $tenant) {
            return response()->json([
                'error' => 'Negócio não encontrado.',
            ], 404);
        }

        return response()->json([
            'id' => $tenant->id,
            'name' => $tenant->name,
            'domain' => $tenant->domain,
            'theme' => $tenant->theme,
        ]);
    }

    /**
     * Listar serviços públicos de um tenant
     */
    public function getServices(string $domain): JsonResponse
    {
        $tenant = Tenant::where('domain', $domain)
            ->where('is_active', true)
            ->first();

        if (! $tenant) {
            return response()->json([
                'error' => 'Negócio não encontrado.',
            ], 404);
        }

        $services = Service::with('professionals')
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($services);
    }

    /**
     * Verificar disponibilidade de horários
     */
    public function getAvailability(Request $request, string $domain): JsonResponse
    {
        $tenant = Tenant::where('domain', $domain)
            ->where('is_active', true)
            ->first();

        if (! $tenant) {
            return response()->json([
                'error' => 'Negócio não encontrado.',
            ], 404);
        }

        $request->validate([
            'date' => 'required|date',
            'service_id' => 'required|exists:services,id',
            'duration' => 'nullable|integer',
            'professional_id' => 'nullable|exists:professionals,id',
        ]);

        $service = Service::where('id', $request->service_id)
            ->where('tenant_id', $tenant->id)
            ->firstOrFail();

        $professional = null;
        if ($request->filled('professional_id')) {
            $professional = Professional::where('id', $request->professional_id)
                ->where('tenant_id', $tenant->id)
                ->firstOrFail();

            if (! $professional->services()->where('service_id', $service->id)->exists()) {
                return response()->json([
                    'error' => 'Este profissional não atende o serviço selecionado.',
                ], 422);
            }
        }

        $date = \Carbon\Carbon::parse($request->date);
        $duration = $request->duration ?? $service->duration;

        // Horários de trabalho padrão (9h às 18h)
        $workStart = $date->copy()->setTime(9, 0);
        $workEnd = $date->copy()->setTime(18, 0);

        // Buscar agendamentos existentes
        $existingBookings = Booking::where('tenant_id', $tenant->id)
            ->whereDate('start_time', $date)
            ->where('status', '!=', Booking::STATUS_CANCELLED)
            ->when($professional, fn ($q) => $q->where('professional_id', $professional->id))
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

    /**
     * Criar agendamento público (sem autenticação)
     */
    public function createBooking(Request $request, string $domain): JsonResponse
    {
        $tenant = Tenant::where('domain', $domain)
            ->where('is_active', true)
            ->first();

        if (! $tenant) {
            return response()->json([
                'error' => 'Negócio não encontrado.',
            ], 404);
        }

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'service_id' => 'required|exists:services,id',
            'professional_id' => 'nullable|exists:professionals,id',
            'start_time' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Verificar se o serviço pertence ao tenant
        $service = Service::where('id', $validated['service_id'])
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->firstOrFail();

        $professional = null;
        if (! empty($validated['professional_id'])) {
            $professional = Professional::where('id', $validated['professional_id'])
                ->where('tenant_id', $tenant->id)
                ->where('is_active', true)
                ->firstOrFail();

            // Verificar se o profissional atende o serviço
            if (! $professional->services()->where('service_id', $service->id)->exists()) {
                return response()->json([
                    'error' => 'Este profissional não atende o serviço selecionado.',
                ], 422);
            }
        }

        // Buscar ou criar cliente
        $customer = Customer::firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'email' => $validated['customer_email'],
            ],
            [
                'name' => $validated['customer_name'],
                'phone' => $validated['customer_phone'] ?? null,
            ]
        );

        // Atualizar dados do cliente se necessário
        if ($customer->name !== $validated['customer_name'] || $customer->phone !== ($validated['customer_phone'] ?? null)) {
            $customer->update([
                'name' => $validated['customer_name'],
                'phone' => $validated['customer_phone'] ?? null,
            ]);
        }

        try {
            // Criar agendamento
            $booking = $this->bookingService->create([
                'tenant_id' => $tenant->id,
                'customer_id' => $customer->id,
                'service_id' => $service->id,
                'start_time' => $validated['start_time'],
                'notes' => $validated['notes'] ?? null,
                'professional_id' => $validated['professional_id'] ?? null,
            ]);

            return response()->json([
                'message' => 'Agendamento criado com sucesso!',
                'booking' => $booking->load(['customer', 'service']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }
}
