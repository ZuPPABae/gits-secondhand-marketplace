<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ListingController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
        ]);
    });

    // Endpoint Publik
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/listings', [ListingController::class, 'index']);
    Route::get('/listings/{id}', [ListingController::class, 'show']);
    Route::get('/users/{id}', [UserController::class, 'show']);

    // Endpoint Autentikasi Publik
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])
            ->middleware('throttle:auth');
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:auth');
        Route::post('/logout', [AuthController::class, 'logout'])
            ->middleware('auth:sanctum');
    });

    // Endpoint Terproteksi (Login Required)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/me/listings', [ListingController::class, 'myListings']);

        // Kelola Listing
        Route::post('/listings', [ListingController::class, 'store'])
            ->middleware('throttle:uploads');
        Route::match(['put', 'patch', 'post'], '/listings/{id}', [ListingController::class, 'update']);
        Route::delete('/listings/{id}', [ListingController::class, 'destroy']);
        Route::patch('/listings/{id}/status', [ListingController::class, 'updateStatus']);
    });
});
