<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Listar agendamentos
     */
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['customer', 'service', 'user', 'professional'])
            ->where('tenant_id', auth()->user()->tenant_id);

        // Filtros
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->where('start_time', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('start_time', '<=', $request->date_to);
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        $bookings = $query->orderBy('start_time', 'asc')->paginate(20);

        return response()->json($bookings);
    }

    /**
     * Criar agendamento
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'service_id' => 'required|exists:services,id',
            'professional_id' => 'nullable|exists:professionals,id',
            'user_id' => 'nullable|exists:users,id',
            'start_time' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        try {
            $booking = $this->bookingService->create($validated);

            return response()->json($booking->load(['customer', 'service', 'user', 'professional']), 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Exibir agendamento
     */
    public function show(Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        return response()->json($booking->load(['customer', 'service', 'user', 'professional']));
    }

    /**
     * Atualizar agendamento
     */
    public function update(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'customer_id' => 'sometimes|exists:customers,id',
            'service_id' => 'sometimes|exists:services,id',
            'professional_id' => 'nullable|exists:professionals,id',
            'user_id' => 'nullable|exists:users,id',
            'start_time' => 'sometimes|date',
            'status' => 'sometimes|in:pending,confirmed,cancelled,completed',
            'notes' => 'nullable|string',
        ]);

        try {
            $booking = $this->bookingService->update($booking, $validated);

            return response()->json($booking->load(['customer', 'service', 'user', 'professional']));
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Deletar agendamento
     */
    public function destroy(Booking $booking): JsonResponse
    {
        $this->authorize('delete', $booking);

        $booking->delete();

        return response()->json(['message' => 'Agendamento deletado com sucesso']);
    }

    /**
     * Obter agendamentos para calendário
     */
    public function calendar(Request $request): JsonResponse
    {
        $start = $request->input('start', now()->startOfMonth());
        $end = $request->input('end', now()->endOfMonth());

        $bookings = Booking::with(['customer', 'service', 'user', 'professional'])
            ->where('tenant_id', auth()->user()->tenant_id)
            ->whereBetween('start_time', [$start, $end])
            ->get();

        return response()->json($bookings);
    }
}
