<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Professional;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfessionalController extends Controller
{
    public function index(): JsonResponse
    {
        $professionals = Professional::with('services')
            ->where('tenant_id', auth()->user()->tenant_id)
            ->orderBy('name')
            ->get();

        return response()->json($professionals);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'service_ids' => 'array',
            'service_ids.*' => 'exists:services,id',
        ]);

        $professional = Professional::create(array_merge($validated, [
            'tenant_id' => auth()->user()->tenant_id,
        ]));

        if (isset($validated['service_ids'])) {
            $professional->services()->sync($validated['service_ids']);
        }

        return response()->json($professional->load('services'), 201);
    }

    public function show(Professional $professional): JsonResponse
    {
        return response()->json($professional->load('services'));
    }

    public function update(Request $request, Professional $professional): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'service_ids' => 'array',
            'service_ids.*' => 'exists:services,id',
        ]);

        $professional->update($validated);

        if (isset($validated['service_ids'])) {
            $professional->services()->sync($validated['service_ids']);
        }

        return response()->json($professional->load('services'));
    }

    public function destroy(Professional $professional): JsonResponse
    {
        $professional->delete();

        return response()->json(['message' => 'Profissional removido com sucesso']);
    }
}

