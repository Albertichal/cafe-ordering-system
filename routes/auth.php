<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes - Cafe Ichal
|--------------------------------------------------------------------------
|
| SIMPLIFIED: Login & Logout ONLY
| No register, no password reset, no email verification
|
*/

// ========================================
// GUEST ROUTES (Not Logged In)
// ========================================

Route::middleware('guest')->group(function () {
    // Login Page
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
                ->name('login');

    // Login Submit
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

// ========================================
// AUTHENTICATED ROUTES (Logged In)
// ========================================

Route::middleware('auth')->group(function () {
    // Logout
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
                ->name('logout');
});

/*
|--------------------------------------------------------------------------
| REMOVED ROUTES (Not Needed for Cafe Ichal)
|--------------------------------------------------------------------------
|
| ❌ Registration routes (admin dibuat manual via database)
| ❌ Password reset routes (admin hubungi superadmin)
| ❌ Email verification routes (ga perlu verifikasi email)
| ❌ Password confirmation routes (ga perlu)
|
*/