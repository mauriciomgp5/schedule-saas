<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AvailabilityController extends Controller
{
    /**
     * Lista todas as disponibilidades do tenant
     */
    public function index(Request $request)
    {
        $availabilities = Availability::where('tenant_id', $request->user()->tenant_id)
            ->with('service')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json($availabilities);
    }

    /**
     * Cria uma nova disponibilidade
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_id' => 'nullable|exists:services,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'type' => 'required|in:regular,exception',
            'exception_date' => 'nullable|date',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar se o service_id pertence ao tenant do usuário
        if ($request->service_id) {
            $serviceExists = \App\Models\Service::where('id', $request->service_id)
                ->where('tenant_id', $request->user()->tenant_id)
                ->exists();

            if (!$serviceExists) {
                return response()->json([
                    'message' => 'Serviço não encontrado'
                ], 404);
            }
        }

        // Verificar se já existe um horário conflitante no mesmo dia
        $conflictingAvailability = Availability::where('tenant_id', $request->user()->tenant_id)
            ->where('day_of_week', $request->day_of_week)
            ->where('service_id', $request->service_id) // Mesmo serviço ou ambos null
            ->where(function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    // Verifica se o novo horário está dentro de um horário existente
                    $q->where('start_time', '<=', $request->start_time)
                        ->where('end_time', '>', $request->start_time);
                })->orWhere(function ($q) use ($request) {
                    // Verifica se o novo horário contém um horário existente
                    $q->where('start_time', '>=', $request->start_time)
                        ->where('start_time', '<', $request->end_time);
                })->orWhere(function ($q) use ($request) {
                    // Verifica se o novo horário é exatamente igual
                    $q->where('start_time', $request->start_time)
                        ->where('end_time', $request->end_time);
                });
            })
            ->first();

        if ($conflictingAvailability) {
            return response()->json([
                'message' => 'Já existe um horário configurado para este período no mesmo dia',
                'conflicting_time' => $conflictingAvailability->start_time . ' - ' . $conflictingAvailability->end_time
            ], 422);
        }

        $availability = Availability::create([
            'tenant_id' => $request->user()->tenant_id,
            'service_id' => $request->service_id,
            'day_of_week' => $request->day_of_week,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'type' => $request->type,
            'exception_date' => $request->exception_date,
            'is_available' => $request->is_available ?? true,
        ]);

        return response()->json($availability->load('service'), 201);
    }

    /**
     * Exibe uma disponibilidade específica
     */
    public function show(Request $request, $id)
    {
        $availability = Availability::where('tenant_id', $request->user()->tenant_id)
            ->with('service')
            ->findOrFail($id);

        return response()->json($availability);
    }

    /**
     * Atualiza uma disponibilidade
     */
    public function update(Request $request, $id)
    {
        $availability = Availability::where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'service_id' => 'nullable|exists:services,id',
            'day_of_week' => 'sometimes|required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'sometimes|required|date_format:H:i',
            'end_time' => 'sometimes|required|date_format:H:i',
            'type' => 'sometimes|required|in:regular,exception',
            'exception_date' => 'nullable|date',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar se o service_id pertence ao tenant do usuário
        if ($request->has('service_id') && $request->service_id) {
            $serviceExists = \App\Models\Service::where('id', $request->service_id)
                ->where('tenant_id', $request->user()->tenant_id)
                ->exists();

            if (!$serviceExists) {
                return response()->json([
                    'message' => 'Serviço não encontrado'
                ], 404);
            }
        }

        // Verificar se já existe um horário conflitante no mesmo dia (excluindo o atual)
        $dayOfWeek = $request->has('day_of_week') ? $request->day_of_week : $availability->day_of_week;
        $startTime = $request->has('start_time') ? $request->start_time : $availability->start_time;
        $endTime = $request->has('end_time') ? $request->end_time : $availability->end_time;
        $serviceId = $request->has('service_id') ? $request->service_id : $availability->service_id;

        $conflictingAvailability = Availability::where('tenant_id', $request->user()->tenant_id)
            ->where('id', '!=', $id) // Excluir o horário atual
            ->where('day_of_week', $dayOfWeek)
            ->where('service_id', $serviceId) // Mesmo serviço ou ambos null
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    // Verifica se o novo horário está dentro de um horário existente
                    $q->where('start_time', '<=', $startTime)
                        ->where('end_time', '>', $startTime);
                })->orWhere(function ($q) use ($startTime, $endTime) {
                    // Verifica se o novo horário contém um horário existente
                    $q->where('start_time', '>=', $startTime)
                        ->where('start_time', '<', $endTime);
                })->orWhere(function ($q) use ($startTime, $endTime) {
                    // Verifica se o novo horário é exatamente igual
                    $q->where('start_time', $startTime)
                        ->where('end_time', $endTime);
                });
            })
            ->first();

        if ($conflictingAvailability) {
            return response()->json([
                'message' => 'Já existe um horário configurado para este período no mesmo dia',
                'conflicting_time' => $conflictingAvailability->start_time . ' - ' . $conflictingAvailability->end_time
            ], 422);
        }

        $availability->update($request->all());

        return response()->json($availability->load('service'));
    }

    /**
     * Remove uma disponibilidade
     */
    public function destroy(Request $request, $id)
    {
        $availability = Availability::where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        $availability->delete();

        return response()->json(['message' => 'Disponibilidade removida com sucesso']);
    }
}
