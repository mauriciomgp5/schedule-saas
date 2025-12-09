<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() && auth()->user()->tenant_id) {
            // O tenant já está definido pelo usuário autenticado
            // O trait TenantScoped cuida do isolamento de dados
            return $next($request);
        }

        return response()->json([
            'error' => 'Tenant não identificado.',
        ], 403);
    }
}
