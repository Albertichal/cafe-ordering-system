<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Inertia\Inertia;

class Dashboardcontroller extends Controller
{
    public function index()
    {
        $menus = Menu::all()->groupBy('category');

        return Inertia::render('Admin/Dashboard', [
            'menus' => $menus,
        ]);
    }
}
