<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\PublicStoreController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rotas públicas (sem autenticação)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rotas públicas para clientes (acesso por slug da loja)
Route::prefix('public')->group(function () {
    Route::get('/store/{slug}', [PublicStoreController::class, 'getStoreBySlug']);
    Route::get('/store/{slug}/services', [PublicStoreController::class, 'getStoreServices']);
    Route::get('/store/{slug}/categories', [PublicStoreController::class, 'getStoreCategories']);
    Route::get('/store/{slug}/availability', [PublicStoreController::class, 'getStoreAvailability']);
    Route::get('/store/{slug}/slots', [PublicStoreController::class, 'getAvailableSlots']);
    Route::post('/store/{slug}/booking', [PublicStoreController::class, 'createBooking']);
});

// Rotas protegidas (com autenticação)
Route::middleware('auth:sanctum')->group(function () {
    // Autenticação
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Serviços
    Route::apiResource('services', ServiceController::class);

    // Disponibilidade/Horários
    Route::apiResource('availabilities', AvailabilityController::class);
});
