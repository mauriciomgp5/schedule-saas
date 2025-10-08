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
