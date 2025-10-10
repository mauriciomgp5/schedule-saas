<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\BookingController;
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
    Route::get('/store/{slug}/bookings', [PublicStoreController::class, 'getCustomerBookings']);
    Route::post('/store/{slug}/booking/{bookingId}/cancel', [PublicStoreController::class, 'cancelBooking']);

    // Rotas de autenticação via SMS
    Route::post('/store/{slug}/send-sms', [PublicStoreController::class, 'sendSms']);
    Route::post('/store/{slug}/verify-sms', [PublicStoreController::class, 'verifySms']);

    // Rotas de autenticação com telefone + senha
    Route::post('/store/{slug}/login', [PublicStoreController::class, 'login']);
    Route::post('/store/{slug}/register', [PublicStoreController::class, 'register']);
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

    // Agendamentos (Admin) - Rotas específicas ANTES do apiResource
    Route::get('bookings/stats', [BookingController::class, 'stats']);
    Route::post('bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::post('bookings/{id}/complete', [BookingController::class, 'complete']);
    Route::post('bookings/{id}/confirm', [BookingController::class, 'confirm']);
    Route::apiResource('bookings', BookingController::class)->only(['index', 'show', 'update']);
});
