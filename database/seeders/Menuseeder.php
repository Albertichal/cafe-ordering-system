<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menus = [
            // Makanan Berat (no variants)
            [
                'name' => 'Ayam Bakar',
                'category' => 'Makanan Berat',
                'description' => 'Ayam bakar bumbu kecap pedas manis',
                'price' => 20000,
                'image' => '🍗',
                'status' => 'ready',
                'variants' => null,
            ],
            [
                'name' => 'Nasi Goreng',
                'category' => 'Makanan Berat',
                'description' => 'Nasi goreng spesial dengan telur',
                'price' => 18000,
                'image' => '🍳',
                'status' => 'ready',
                'variants' => null,
            ],
            [
                'name' => 'Nasi Putih',
                'category' => 'Makanan Berat',
                'description' => 'Nasi putih hangat',
                'price' => 6000,
                'image' => '🍚',
                'status' => 'ready',
                'variants' => null,
            ],

            // Minuman (with variants: Hot, Warm, Ice)
            [
                'name' => 'Teh Obeng',
                'category' => 'Minuman',
                'description' => 'Teh manis segar',
                'price' => 7000,
                'image' => '🍵',
                'status' => 'ready',
                'variants' => json_encode(['Hot', 'Warm', 'Ice']),
            ],
            [
                'name' => 'Kopi Hitam',
                'category' => 'Minuman',
                'description' => 'Kopi hitam murni tanpa gula',
                'price' => 10000,
                'image' => '☕',
                'status' => 'ready',
                'variants' => json_encode(['Hot', 'Warm', 'Ice']),
            ],
            [
                'name' => 'Arren Latte',
                'category' => 'Minuman',
                'description' => 'Kopi susu creamy premium',
                'price' => 15000,
                'image' => '☕',
                'status' => 'ready',
                'variants' => json_encode(['Hot', 'Warm', 'Ice']),
            ],
            [
                'name' => 'Coklat',
                'category' => 'Minuman',
                'description' => 'Minuman coklat manis',
                'price' => 12000,
                'image' => '🍫',
                'status' => 'ready',
                'variants' => json_encode(['Hot', 'Warm', 'Ice']),
            ],
            [
                'name' => 'Thai Tea',
                'category' => 'Minuman',
                'description' => 'Teh Thailand original',
                'price' => 13000,
                'image' => '🧋',
                'status' => 'ready',
                'variants' => json_encode(['Ice']), // Thai Tea biasanya cuma ice
            ],

            // Snack (no variants)
            [
                'name' => 'Pisang Goreng',
                'category' => 'Snack',
                'description' => 'Pisang goreng crispy',
                'price' => 8000,
                'image' => '🍌',
                'status' => 'ready',
                'variants' => null,
            ],
            [
                'name' => 'Kentang Goreng',
                'category' => 'Snack',
                'description' => 'French fries crispy',
                'price' => 10000,
                'image' => '🍟',
                'status' => 'ready',
                'variants' => null,
            ],
        ];

        foreach ($menus as $menu) {
            DB::table('menus')->insert(array_merge($menu, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
