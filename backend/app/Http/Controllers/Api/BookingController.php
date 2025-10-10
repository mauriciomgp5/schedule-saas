<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Listar todos os agendamentos do tenant do usuário autenticado
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user->tenant_id) {
            return response()->json(['message' => 'Usuário não possui tenant associado'], 403);
        }

        $query = Booking::with(['service', 'customer'])
            ->where('tenant_id', $user->tenant_id);

        // Filtro por status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filtro por data
        if ($request->filled('date_from')) {
            $query->whereDate('booking_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('booking_date', '<=', $request->date_to);
        }

        // Filtro por serviço
        if ($request->filled('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        // Busca por nome de cliente ou número do agendamento
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('booking_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($customerQuery) use ($search) {
                      $customerQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'booking_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $bookings = $query->paginate($request->get('per_page', 15));

        return response()->json($bookings);
    }

    /**
     * Mostrar detalhes de um agendamento específico
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $booking = Booking::with(['service', 'customer', 'employee'])
            ->where('tenant_id', $user->tenant_id)
            ->findOrFail($id);

        return response()->json($booking);
    }

    /**
     * Atualizar um agendamento (notas internas, etc)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        $booking = Booking::where('tenant_id', $user->tenant_id)->findOrFail($id);

        $validated = $request->validate([
            'internal_notes' => 'nullable|string',
            'customer_notes' => 'nullable|string',
            'booking_date' => 'nullable|date',
        ]);

        $booking->update($validated);

        return response()->json([
            'message' => 'Agendamento atualizado com sucesso',
            'booking' => $booking->load(['service', 'customer'])
        ]);
    }

    /**
     * Cancelar um agendamento
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();

        $booking = Booking::where('tenant_id', $user->tenant_id)->findOrFail($id);

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Este agendamento já foi cancelado'], 400);
        }

        if ($booking->status === 'completed') {
            return response()->json(['message' => 'Não é possível cancelar um agendamento já concluído'], 400);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['cancellation_reason'],
            'cancelled_at' => now(),
            'cancelled_by' => $user->id,
        ]);

        return response()->json([
            'message' => 'Agendamento cancelado com sucesso',
            'booking' => $booking->load(['service', 'customer'])
        ]);
    }

    /**
     * Marcar agendamento como concluído
     */
    public function complete(Request $request, $id)
    {
        $user = $request->user();

        $booking = Booking::where('tenant_id', $user->tenant_id)->findOrFail($id);

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Não é possível concluir um agendamento cancelado'], 400);
        }

        if ($booking->status === 'completed') {
            return response()->json(['message' => 'Este agendamento já foi marcado como concluído'], 400);
        }

        $booking->update([
            'status' => 'completed',
        ]);

        return response()->json([
            'message' => 'Agendamento marcado como concluído',
            'booking' => $booking->load(['service', 'customer'])
        ]);
    }

    /**
     * Marcar agendamento como confirmado
     */
    public function confirm(Request $request, $id)
    {
        $user = $request->user();

        $booking = Booking::where('tenant_id', $user->tenant_id)->findOrFail($id);

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Não é possível confirmar um agendamento cancelado'], 400);
        }

        if ($booking->status === 'completed') {
            return response()->json(['message' => 'Este agendamento já foi concluído'], 400);
        }

        $booking->update([
            'status' => 'confirmed',
        ]);

        return response()->json([
            'message' => 'Agendamento confirmado com sucesso',
            'booking' => $booking->load(['service', 'customer'])
        ]);
    }

    /**
     * Obter estatísticas de agendamentos
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        if (!$user->tenant_id) {
            return response()->json(['message' => 'Usuário não possui tenant associado'], 403);
        }

        $today = now()->startOfDay();
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        $stats = [
            'today' => Booking::where('tenant_id', $user->tenant_id)
                ->whereDate('booking_date', $today)
                ->whereNotIn('status', ['cancelled'])
                ->count(),

            'pending' => Booking::where('tenant_id', $user->tenant_id)
                ->where('status', 'pending')
                ->count(),

            'confirmed' => Booking::where('tenant_id', $user->tenant_id)
                ->where('status', 'confirmed')
                ->count(),

            'completed' => Booking::where('tenant_id', $user->tenant_id)
                ->where('status', 'completed')
                ->count(),

            'cancelled' => Booking::where('tenant_id', $user->tenant_id)
                ->where('status', 'cancelled')
                ->count(),

            'month_total' => Booking::where('tenant_id', $user->tenant_id)
                ->whereBetween('booking_date', [$startOfMonth, $endOfMonth])
                ->whereNotIn('status', ['cancelled'])
                ->count(),

            'month_revenue' => Booking::where('tenant_id', $user->tenant_id)
                ->whereBetween('booking_date', [$startOfMonth, $endOfMonth])
                ->where('status', 'completed')
                ->sum('price'),
        ];

        return response()->json($stats);
    }
}
