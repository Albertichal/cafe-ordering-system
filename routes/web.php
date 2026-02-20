<?php

use App\Http\Controllers\Menucontroller;
use App\Http\Controllers\Dashboardcontroller;
use App\Http\Controllers\AIController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;


// Homepage - Menu List (Halaman Pesan Customer)
Route::get('/', [Menucontroller::class, 'index'])->name('menu.index');

// Login & Logout (Cuma Admin)
require __DIR__.'/auth.php';

Route::middleware(['auth'])->group(function () {
    // Dashboard - Menu Management & Order Aktif
    Route::get('/dashboard', [Dashboardcontroller::class, 'index'])->name('dashboard');
});


// AI Chatbot
Route::post('/api/chat', [AIController::class, 'chat']);

// Menus - Dapetin Semua Menu (untuk chatbot & customer)
Route::get('/api/menus', [Menucontroller::class, 'getMenus']);

// Orders - Customer Ngebuat Order
Route::post('/api/orders', [OrderController::class, 'store']);

// Orders - Tunggu Pesanan (untuk admin dashboard)
Route::get('/api/orders/pending', [OrderController::class, 'getPendingOrders']);

// Orders - Update status (untuk admin)
Route::patch('/api/orders/{order}/status', [OrderController::class, 'updateStatus']);

Route::middleware(['auth'])->prefix('admin')->group(function () {
    // Menu CRUD
    Route::post('/menus', [Menucontroller::class, 'store']);
    Route::post('/menus/{menu}', [Menucontroller::class, 'update']); 
    Route::patch('/menus/{menu}/status', [Menucontroller::class, 'updateStatus']);
    Route::delete('/menus/{menu}', [Menucontroller::class, 'destroy']);
});

// Redirect root ke dashboard kalo udah login
Route::middleware(['auth'])->get('/home', function () {
    return redirect()->route('dashboard');
});









