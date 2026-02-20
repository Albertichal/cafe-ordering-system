<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    // Halaman Login
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');
    // Masukan
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});
Route::middleware('auth')->group(function () {
    // Logout
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
