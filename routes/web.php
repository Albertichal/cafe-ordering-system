<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\Dashboardcontroller;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Guest Routes (Public)
|--------------------------------------------------------------------------
*/

// Homepage - Guest Menu List
Route::get('/', [MenuController::class, 'index'])->name('home');

// AI Chat Endpoint
Route::post('/api/chat', [AIController::class, 'chat'])->name('ai.chat');

// Get Available Menus
Route::get('/api/menus', [MenuController::class, 'getMenus'])->name('menus.api');

// Create Order (Guest)
Route::post('/api/orders', [OrderController::class, 'store'])->name('orders.store');

/*
|--------------------------------------------------------------------------
| Admin Routes (Protected)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [Dashboardcontroller::class, 'index'])->name('dashboard');

    // Menu Management
    Route::get('/admin/menus', [MenuController::class, 'adminIndex'])->name('admin.menus');
    Route::post('/admin/menus', [MenuController::class, 'store'])->name('admin.menus.store');
    Route::patch('/admin/menus/{menu}/status', [MenuController::class, 'updateStatus'])->name('admin.menus.status');
    Route::put('/admin/menus/{menu}', [MenuController::class, 'update'])->name('admin.menus.update');
    Route::delete('/admin/menus/{menu}', [MenuController::class, 'destroy'])->name('admin.menus.destroy');

    // Order Management
    Route::get('/api/orders/pending', [OrderController::class, 'getPendingOrders'])->name('orders.pending');
    Route::patch('/api/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::get('/api/orders/history', [OrderController::class, 'history'])->name('orders.history');

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';