<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Service;
use App\Models\Availability;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Booking;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PublicStoreController extends Controller
{
    /**
     * Busca uma loja pelo slug
     */
    public function getStoreBySlug($slug)
    {
        $tenant = Tenant::where('slug', $slug)
            ->where('is_active', true)
            ->with('settings')
            ->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada'
            ], 404);
        }

        return response()->json($tenant);
    }

    /**
     * Lista todos os serviços ativos de uma loja
     */
    public function getStoreServices($slug)
    {
        $tenant = Tenant::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada'
            ], 404);
        }

        $services = Service::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->with('category')
            ->orderBy('name')
            ->get();

        return response()->json($services);
    }

    /**
     * Lista todas as categorias de uma loja
     */
    public function getStoreCategories($slug)
    {
        $tenant = Tenant::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada'
            ], 404);
        }

        $categories = Category::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    /**
     * Lista a disponibilidade de uma loja
     */
    public function getStoreAvailability($slug)
    {
        $tenant = Tenant::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada'
            ], 404);
        }

        $availabilities = Availability::where('tenant_id', $tenant->id)
            ->where('is_available', true)
            ->with('service')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json($availabilities);
    }

    /**
     * Busca horários disponíveis para um serviço específico em uma data
     */
    public function getAvailableSlots($slug, Request $request)
    {
        $tenant = Tenant::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada'
            ], 404);
        }

        $request->validate([
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date|after_or_equal:today',
        ]);

        $service = Service::where('id', $request->service_id)
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->first();

        if (!$service) {
            return response()->json([
                'message' => 'Serviço não encontrado'
            ], 404);
        }

        $date = Carbon::parse($request->date);
        $dayOfWeek = strtolower($date->format('l')); // monday, tuesday, etc.

        // Buscar disponibilidades para o dia da semana
        $availabilities = Availability::where('tenant_id', $tenant->id)
            ->where('is_available', true)
            ->where(function ($query) use ($service, $dayOfWeek) {
                $query->where('service_id', $service->id)
                    ->orWhere('service_id', null); // Disponibilidade geral
            })
            ->where('day_of_week', $dayOfWeek)
            ->orderBy('start_time')
            ->get();

        if ($availabilities->isEmpty()) {
            return response()->json([
                'message' => 'Nenhum horário disponível para este dia',
                'slots' => []
            ]);
        }

        // Buscar configurações da loja para obter o intervalo entre slots
        $settings = $tenant->settings;
        $intervalBetweenSlots = $settings ? $settings->interval_between_slots : 0;

        // Gerar slots de tempo baseado na duração do serviço + intervalo
        $slots = [];
        foreach ($availabilities as $availability) {
            $startTime = Carbon::parse($date->format('Y-m-d') . ' ' . $availability->start_time);
            $endTime = Carbon::parse($date->format('Y-m-d') . ' ' . $availability->end_time);

            $currentTime = $startTime->copy();
            $totalSlotDuration = $service->duration + $intervalBetweenSlots;

            while ($currentTime->addMinutes($totalSlotDuration)->lte($endTime)) {
                $slotEnd = $currentTime->copy();
                $currentTime->subMinutes($totalSlotDuration); // Voltar para o início do slot

                $slots[] = [
                    'start_time' => $currentTime->format('H:i'),
                    'end_time' => $currentTime->addMinutes($service->duration)->format('H:i'),
                    'date' => $date->format('Y-m-d'),
                    'available' => true, // TODO: Verificar se já tem agendamento
                ];

                $currentTime->addMinutes($intervalBetweenSlots); // Adicionar intervalo para próximo slot
            }
        }

        return response()->json([
            'service' => $service,
            'date' => $date->format('Y-m-d'),
            'slots' => $slots
        ]);
    }

    /**
     * Cria um novo agendamento
     */
    public function createBooking($slug, Request $request)
    {
        // Log para debug
        Log::info('Creating booking - METHOD CALLED', [
            'slug' => $slug,
            'service_id' => $request->service_id,
            'customer_phone' => $request->customer_phone,
            'booking_date' => $request->booking_date,
            'all_data' => $request->all()
        ]);

        $tenant = Tenant::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada'
            ], 404);
        }

        $request->validate([
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'notes' => 'nullable|string',
            'accept_whatsapp_reminders' => 'nullable|boolean',
        ]);

        // Combinar data e hora
        $bookingDateTime = Carbon::parse($request->date . ' ' . $request->time);
        $now = Carbon::now();

        // Se for para um dia diferente (futuro), sempre permitir
        if ($bookingDateTime->isFuture() && !$bookingDateTime->isSameDay($now)) {
            // Agendamento para dia futuro - sempre válido
        } else {
            // Para o mesmo dia, verificar se é pelo menos 1 hora no futuro
            $minutesDifference = $bookingDateTime->diffInMinutes($now, false);

            if ($minutesDifference < 60) {
                $currentTime = $now->format('H:i');
                $bookingTime = $bookingDateTime->format('H:i');
                $bookingDate = $bookingDateTime->format('d/m/Y');

                return response()->json([
                    'message' => "O agendamento deve ser feito com pelo menos 1 hora de antecedência. Horário atual: {$currentTime}, Agendamento solicitado: {$bookingTime} do dia {$bookingDate}"
                ], 422);
            }
        }

        $service = Service::where('id', $request->service_id)
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->first();

        if (!$service) {
            return response()->json([
                'message' => 'Serviço não encontrado'
            ], 404);
        }

        // Buscar ou criar cliente (1 cliente por loja/tenant)
        $customer = Customer::firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'phone' => $request->customer_phone,
            ],
            [
                'name' => $request->customer_name,
                'email' => $request->customer_email,
                'notes' => $request->notes,
                'accept_whatsapp_reminders' => $request->accept_whatsapp_reminders ?? false,
            ]
        );

        // Se o cliente já existia, atualizar dados se necessário
        if (!$customer->wasRecentlyCreated) {
            $customer->update([
                'name' => $request->customer_name,
                'email' => $request->customer_email ?: $customer->email,
                'notes' => $request->notes ?: $customer->notes,
                'accept_whatsapp_reminders' => $request->accept_whatsapp_reminders ?? $customer->accept_whatsapp_reminders,
            ]);
        }

        // Criar agendamento real no banco
        $bookingNumber = 'BK' . time() . rand(100, 999);

        try {
            $booking = Booking::create([
                'tenant_id' => $tenant->id,
                'service_id' => $service->id,
                'user_id' => null, // Por enquanto null, pois customer não é user
                'customer_id' => $customer->id,
                'booking_number' => $bookingNumber,
                'booking_date' => $bookingDateTime,
                'duration' => $service->duration,
                'price' => $service->price,
                'status' => 'pending',
                'customer_notes' => $request->customer_notes,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating booking: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao criar agendamento: ' . $e->getMessage()
            ], 500);
        }

        $message = 'Agendamento criado com sucesso!';
        if ($request->accept_whatsapp_reminders) {
            $message .= ' Você receberá lembretes via WhatsApp antes do seu agendamento.';
        }

        return response()->json([
            'message' => $message,
            'booking' => [
                'id' => $booking->id,
                'service_name' => $service->name,
                'booking_date' => $booking->booking_date->toISOString(),
                'customer_name' => $request->customer_name,
                'customer_id' => $customer->id,
                'status' => $booking->status,
                'whatsapp_reminders' => $request->accept_whatsapp_reminders ?? false
            ]
        ], 201);
    }

    /**
     * Buscar agendamentos do cliente
     */
    public function getCustomerBookings(Request $request, $slug)
    {
        $tenant = Tenant::where('slug', $slug)->where('is_active', true)->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada'
            ], 404);
        }

        $request->validate([
            'customer_phone' => 'required|string'
        ]);

        // Buscar agendamentos reais do cliente
        $customer = Customer::where('tenant_id', $tenant->id)
            ->where('phone', $request->customer_phone)
            ->first();

        if (!$customer) {
            return response()->json([]);
        }

        // Buscar agendamentos reais do cliente usando customer_id
        $bookings = Booking::where('tenant_id', $tenant->id)
            ->where('customer_id', $customer->id)
            ->with(['service', 'customer'])
            ->orderBy('booking_date', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'service_name' => $booking->service->name,
                    'booking_date' => $booking->booking_date->toISOString(),
                    'customer_name' => $booking->customer->name,
                    'status' => $booking->status,
                    'whatsapp_reminders' => $booking->customer->accept_whatsapp_reminders ?? false
                ];
            });

        return response()->json($bookings);
    }

    /**
     * Cancelar agendamento
     */
    public function cancelBooking(Request $request, $slug, $bookingId)
    {
        $tenant = Tenant::where('slug', $slug)->where('is_active', true)->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada'
            ], 404);
        }

        // Buscar o agendamento
        $booking = Booking::where('id', $bookingId)
            ->where('tenant_id', $tenant->id)
            ->first();

        if (!$booking) {
            return response()->json([
                'message' => 'Agendamento não encontrado'
            ], 404);
        }

        // Cancelar o agendamento
        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => 'Cancelado pelo cliente'
        ]);

        return response()->json([
            'message' => 'Agendamento cancelado com sucesso!'
        ]);
    }

    /**
     * Envia código SMS para verificação via Twilio Verify
     */
    public function sendSms(Request $request, $slug)
    {
        $tenant = Tenant::where('slug', $slug)->where('is_active', true)->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada'
            ], 404);
        }

        $request->validate([
            'phone' => 'required|string|min:10',
            'name' => 'nullable|string|max:255',
            'isLogin' => 'nullable|boolean'
        ]);

        $smsService = new SmsService();

        // Verificar se o telefone é válido
        if (!$smsService->isValidPhoneNumber($request->phone)) {
            return response()->json([
                'message' => 'Número de telefone inválido'
            ], 422);
        }

        // Enviar código via Twilio Verify
        $result = $smsService->sendVerificationCode($request->phone, $request->name);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message']
            ], 500);
        }

        $message = $request->isLogin
            ? 'Código de verificação enviado para seu telefone'
            : 'Código de verificação enviado para seu telefone';

        return response()->json([
            'message' => $message,
            'phone' => $request->phone,
            'status' => $result['status']
        ]);
    }

    /**
     * Verifica código SMS via Twilio Verify e autentica o cliente
     */
    public function verifySms(Request $request, $slug)
    {
        $tenant = Tenant::where('slug', $slug)->where('is_active', true)->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada'
            ], 404);
        }

        $request->validate([
            'phone' => 'required|string|min:10',
            'smsCode' => 'required|string|size:6',
            'name' => 'nullable|string|max:255'
        ]);

        $smsService = new SmsService();

        // Verificar código via Twilio Verify
        $result = $smsService->verifyCode($request->phone, $request->smsCode);

        if (!$result['success'] || !$result['valid']) {
            return response()->json([
                'message' => $result['message']
            ], 422);
        }

        // Buscar ou criar cliente
        $customer = Customer::firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'phone' => $request->phone,
            ],
            [
                'name' => $request->name ?: 'Cliente',
                'email' => null,
                'notes' => null,
                'accept_whatsapp_reminders' => true,
                'sms_code' => $request->smsCode, // Salvar código como senha
            ]
        );

        // Se o cliente já existia, atualizar dados se necessário
        if (!$customer->wasRecentlyCreated) {
            $customer->update([
                'name' => $request->name ?: $customer->name,
                'sms_code' => $request->smsCode, // Atualizar senha
            ]);
        }

        return response()->json([
            'message' => 'Verificação realizada com sucesso!',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'sms_code' => $request->smsCode
            ]
        ]);
    }

    public function login(Request $request, $slug)
    {
        $tenant = Tenant::where('slug', $slug)->first();
        if (!$tenant) {
            return response()->json(['message' => 'Loja não encontrada'], 404);
        }

        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string|min:6'
        ]);

        $customer = Customer::where('tenant_id', $tenant->id)
            ->where('phone', $request->phone)
            ->first();

        if (!$customer) {
            return response()->json(['message' => 'Telefone não encontrado'], 404);
        }

        // Verificar senha (comparar com sms_code)
        if ($customer->sms_code !== $request->password) {
            return response()->json(['message' => 'Senha incorreta'], 401);
        }

        return response()->json([
            'message' => 'Login realizado com sucesso!',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone
            ]
        ]);
    }

    public function register(Request $request, $slug)
    {
        $tenant = Tenant::where('slug', $slug)->first();
        if (!$tenant) {
            return response()->json(['message' => 'Loja não encontrada'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:customers,phone,NULL,id,tenant_id,' . $tenant->id,
            'password' => 'required|string|min:6'
        ]);

        $customer = Customer::create([
            'tenant_id' => $tenant->id,
            'name' => $request->name,
            'phone' => $request->phone,
            'sms_code' => $request->password, // Usar senha como sms_code
        ]);

        return response()->json([
            'message' => 'Conta criada com sucesso!',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone
            ]
        ]);
    }
}
