<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\AvailabilityController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rotas públicas (sem autenticação)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

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
