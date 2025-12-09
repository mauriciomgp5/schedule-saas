<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ThemeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rotas públicas
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Rotas protegidas de autenticação
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // Login social restrito aos provedores configurados
    Route::get('/{provider}', [AuthController::class, 'redirectToProvider'])
        ->where('provider', 'google|github');
    Route::get('/{provider}/callback', [AuthController::class, 'handleProviderCallback'])
        ->where('provider', 'google|github');
});

// Rotas públicas de agendamento (por domínio do tenant)
Route::prefix('public/{domain}')->group(function () {
    Route::get('/', [PublicController::class, 'getTenantByDomain']);
    Route::get('/services', [PublicController::class, 'getServices']);
    Route::get('/availability', [PublicController::class, 'getAvailability']);
    Route::post('/bookings', [PublicController::class, 'createBooking']);
});

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {

    // Agendamentos
    Route::apiResource('bookings', BookingController::class);
    Route::get('/bookings/calendar/events', [BookingController::class, 'calendar']);

    // Serviços
    Route::apiResource('services', ServiceController::class);

    // Profissionais
    Route::apiResource('professionals', \App\Http\Controllers\Api\ProfessionalController::class);

    // Clientes
    Route::apiResource('customers', CustomerController::class);

    // Calendário
    Route::prefix('calendar')->group(function () {
        Route::get('/events', [CalendarController::class, 'events']);
        Route::get('/availability', [CalendarController::class, 'availability']);
    });

    // Tema
    Route::prefix('theme')->group(function () {
        Route::get('/', [ThemeController::class, 'show']);
        Route::put('/', [ThemeController::class, 'update']);
        Route::post('/logo', [ThemeController::class, 'uploadLogo']);
        Route::post('/favicon', [ThemeController::class, 'uploadFavicon']);
    });
});
