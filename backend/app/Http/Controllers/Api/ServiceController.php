<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Listar serviços
     */
    public function index(Request $request): JsonResponse
    {
        $query = Service::where('tenant_id', auth()->user()->tenant_id);

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $services = $query->orderBy('name')->get();

        return response()->json($services);
    }

    /**
     * Criar serviço
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'required|integer|min:15',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'color' => 'nullable|string|max:7',
        ]);

        $service = Service::create(array_merge($validated, [
            'tenant_id' => auth()->user()->tenant_id,
        ]));

        return response()->json($service, 201);
    }

    /**
     * Exibir serviço
     */
    public function show(Service $service): JsonResponse
    {
        $this->authorize('view', $service);

        return response()->json($service);
    }

    /**
     * Atualizar serviço
     */
    public function update(Request $request, Service $service): JsonResponse
    {
        $this->authorize('update', $service);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'sometimes|integer|min:15',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'color' => 'nullable|string|max:7',
        ]);

        $service->update($validated);

        return response()->json($service);
    }

    /**
     * Deletar serviço
     */
    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);

        $service->delete();

        return response()->json(['message' => 'Serviço deletado com sucesso']);
    }
}
