<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Listar clientes
     */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::where('tenant_id', auth()->user()->tenant_id);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderBy('name')->paginate(20);

        return response()->json($customers);
    }

    /**
     * Criar cliente
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
            'birth_date' => 'nullable|date',
        ]);

        $customer = Customer::create(array_merge($validated, [
            'tenant_id' => auth()->user()->tenant_id,
        ]));

        return response()->json($customer, 201);
    }

    /**
     * Exibir cliente
     */
    public function show(Customer $customer): JsonResponse
    {
        $this->authorize('view', $customer);

        $customer->load('bookings.service', 'bookings.user');

        return response()->json($customer);
    }

    /**
     * Atualizar cliente
     */
    public function update(Request $request, Customer $customer): JsonResponse
    {
        $this->authorize('update', $customer);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
            'birth_date' => 'nullable|date',
        ]);

        $customer->update($validated);

        return response()->json($customer);
    }

    /**
     * Deletar cliente
     */
    public function destroy(Customer $customer): JsonResponse
    {
        $this->authorize('delete', $customer);

        $customer->delete();

        return response()->json(['message' => 'Cliente deletado com sucesso']);
    }
}
