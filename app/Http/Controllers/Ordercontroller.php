<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // Orderan Baru

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'table_number' => 'required|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.custom_request' => 'nullable|string',
            'items.*.price' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Menghitung Total Harga
            $totalPrice = collect($validated['items'])->sum(function ($item) {
                return $item['price'] * $item['quantity'];
            });

            // Buat Orderan 
            $order = Order::create([
                'customer_name' => $validated['customer_name'],
                'table_number' => $validated['table_number'],
                'total_price' => $totalPrice,
                'status' => 'pending',
            ]);

            // Buat Order Item
            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $item['menu_id'],
                    'quantity' => $item['quantity'],
                    'custom_request' => $item['custom_request'] ?? null,
                    'price' => $item['price'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat!',
                'order' => $order->load('orderItems.menu'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pesanan: '.$e->getMessage(),
            ], 500);
        }
    }

    //Order Yang Tertunda
    public function getPendingOrders()
    {
        $orders = Order::with('orderItems.menu')
            ->where('status', 'pending')
            ->orWhere('status', 'processing')
            ->latest()
            ->get();

        return response()->json($orders);
    }

    // Status Orderan
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diupdate!',
            'order' => $order->load('orderItems.menu'),
        ]);
    }

    //History Order
    public function history()
    {
        $orders = Order::with('orderItems.menu')
            ->where('status', 'completed')
            ->latest()
            ->paginate(20);

        return response()->json($orders);
    }
}
