<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class Menucontroller extends Controller
{
    /**
     * Display a listing of menus (untuk guest)
     */
    public function index()
    {
        $menus = Menu::all()->groupBy('category');

        return Inertia::render('Guest/MenuList', [
            'menus' => $menus,
        ]);
    }

    /**
     * Get all menus as JSON (untuk AI chatbot)
     */
    public function getMenus()
    {
        $menus = Menu::all(); // Return all menus (ready & sold)

        return response()->json($menus);
    }

    /**
     * Display menus for admin
     */
    public function adminIndex()
    {
        $menus = Menu::all()->groupBy('category');

        return Inertia::render('Admin/MenuManagement', [
            'menus' => $menus,
        ]);
    }

    /**
     * Store a newly created menu - WITH IMAGE UPLOAD
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('menu-images', 'public');
            $validated['image'] = '/storage/' . $imagePath;
        }

        $validated['status'] = 'ready';
        $menu = Menu::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil ditambahkan!',
            'menu' => $menu
        ]);
    }

    /**
     * Update menu status (ready/sold)
     */
    public function updateStatus(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'status' => 'required|in:ready,sold',
        ]);

        $menu->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Status menu berhasil diupdate!',
            'menu' => $menu
        ]);
    }

    /**
     * Update menu - WITH IMAGE UPLOAD
     */
    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($menu->image && str_starts_with($menu->image, '/storage/')) {
                $oldImagePath = str_replace('/storage/', '', $menu->image);
                Storage::disk('public')->delete($oldImagePath);
            }

            $imagePath = $request->file('image')->store('menu-images', 'public');
            $validated['image'] = '/storage/' . $imagePath;
        }

        $menu->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil diupdate!',
            'menu' => $menu
        ]);
    }

    /**
     * Remove menu
     */
    public function destroy(Menu $menu)
    {
        // Delete image if exists
        if ($menu->image && str_starts_with($menu->image, '/storage/')) {
            $imagePath = str_replace('/storage/', '', $menu->image);
            Storage::disk('public')->delete($imagePath);
        }

        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dihapus!'
        ]);
    }
}