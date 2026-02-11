<?php

use App\Http\Controllers\Menucontroller;
use App\Http\Controllers\Dashboardcontroller;
use App\Http\Controllers\AIController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| Web Routes - Cafe Ichal
|--------------------------------------------------------------------------
*/

// ========================================
// CUSTOMER ROUTES (Public)
// ========================================

// Homepage - Menu List (Customer ordering page)
Route::get('/', [Menucontroller::class, 'index'])->name('menu.index');

// ========================================
// AUTH ROUTES
// ========================================

// Login & Logout (Admin only)
require __DIR__.'/auth.php';

// ========================================
// ADMIN ROUTES (Protected - Require Login)
// ========================================

Route::middleware(['auth'])->group(function () {
    // Dashboard - Menu Management & Active Orders
    Route::get('/dashboard', [Dashboardcontroller::class, 'index'])->name('dashboard');
});

// ========================================
// API ROUTES - Chatbot & Orders
// ========================================

// AI Chatbot
Route::post('/api/chat', [AIController::class, 'chat']);

// Menus - Get all menus (untuk chatbot & customer)
Route::get('/api/menus', [Menucontroller::class, 'getMenus']);

// Orders - Customer create order
Route::post('/api/orders', [OrderController::class, 'store']);

// Orders - Get pending orders (untuk admin dashboard)
Route::get('/api/orders/pending', [OrderController::class, 'getPendingOrders']);

// Orders - Update status (untuk admin)
Route::patch('/api/orders/{order}/status', [OrderController::class, 'updateStatus']);

// ========================================
// ADMIN API ROUTES - Menu Management
// ========================================

Route::middleware(['auth'])->prefix('admin')->group(function () {
    // Menu CRUD
    Route::post('/menus', [Menucontroller::class, 'store']);
    Route::post('/menus/{menu}', [Menucontroller::class, 'update']); // POST because of file upload
    Route::patch('/menus/{menu}/status', [Menucontroller::class, 'updateStatus']);
    Route::delete('/menus/{menu}', [Menucontroller::class, 'destroy']);
});

// ========================================
// REDIRECT AFTER LOGIN
// ========================================

// Redirect root to dashboard if already logged in
Route::middleware(['auth'])->get('/home', function () {
    return redirect()->route('dashboard');
});









