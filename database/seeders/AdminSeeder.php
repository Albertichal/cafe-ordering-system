<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        if (! User::where('email', 'admin@cafeichal.com')->exists()) {
            User::create([
                'name' => 'Admin Cafe Ichal',
                'email' => 'ichal@gmail.com',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]);

           
        }
    }
}
