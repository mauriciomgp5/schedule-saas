<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    /**
     * Lista todos os serviços do tenant do usuário autenticado
     */
    public function index(Request $request)
    {
        $services = Service::where('tenant_id', $request->user()->tenant_id)
            ->with('category')
            ->orderBy('name')
            ->get();

        return response()->json($services);
    }

    /**
     * Cria um novo serviço
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
            'requires_approval' => 'boolean',
            'max_bookings_per_slot' => 'integer|min:1',
            'buffer_time' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        $service = Service::create([
            'tenant_id' => $request->user()->tenant_id,
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'duration' => $request->duration,
            'color' => $request->color ?? '#3B82F6',
            'is_active' => $request->is_active ?? true,
            'requires_approval' => $request->requires_approval ?? false,
            'max_bookings_per_slot' => $request->max_bookings_per_slot ?? 1,
            'buffer_time' => $request->buffer_time ?? 0,
        ]);

        return response()->json($service->load('category'), 201);
    }

    /**
     * Exibe um serviço específico
     */
    public function show(Request $request, $id)
    {
        $service = Service::where('tenant_id', $request->user()->tenant_id)
            ->with('category')
            ->findOrFail($id);

        return response()->json($service);
    }

    /**
     * Atualiza um serviço
     */
    public function update(Request $request, $id)
    {
        $service = Service::where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'duration' => 'sometimes|required|integer|min:1',
            'color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
            'requires_approval' => 'boolean',
            'max_bookings_per_slot' => 'integer|min:1',
            'buffer_time' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        $service->update($request->all());

        return response()->json($service->load('category'));
    }

    /**
     * Remove um serviço
     */
    public function destroy(Request $request, $id)
    {
        $service = Service::where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        $service->delete();

        return response()->json(['message' => 'Serviço removido com sucesso']);
    }
}
