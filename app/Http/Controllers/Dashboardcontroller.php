<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;

class Dashboardcontroller extends Controller
{
    public function index()
    {
        $menus = Menu::all()->groupBy('category');

        return Inertia::render('Dashboard', [
            'menus' => $menus,
        ]);
    }
}