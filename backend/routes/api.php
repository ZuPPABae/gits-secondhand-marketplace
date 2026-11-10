<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ListingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
        ]);
    });

    // Endpoint Publik: Kategori dan Listing
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/listings', [ListingController::class, 'index']);
    Route::get('/listings/{id}', [ListingController::class, 'show']);

    // Endpoint Autentikasi
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])
            ->middleware('throttle:auth');
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:auth');
        Route::post('/logout', [AuthController::class, 'logout'])
            ->middleware('auth:sanctum');
    });

    // Endpoint Terproteksi
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
    });
});
