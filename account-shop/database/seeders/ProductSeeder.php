<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo sản phẩm Netflix
        $netflix = Product::create([
            'name' => 'Netflix Premium',
            'description' => 'Tài khoản Netflix Premium 1 tháng, xem 4K, 4 màn hình cùng lúc',
            'price' => 50000,
            'is_active' => true,
        ]);

        // Tạo một số tài khoản Netflix mẫu
        for ($i = 1; $i <= 5; $i++) {
            Account::create([
                'product_id' => $netflix->id,
                'username' => "netflix_user{$i}@example.com",
                'password' => "password{$i}",
                'status' => 'available',
            ]);
        }

        // Tạo sản phẩm YouTube Premium
        $youtube = Product::create([
            'name' => 'YouTube Premium',
            'description' => 'Tài khoản YouTube Premium 1 tháng, không quảng cáo, tải video offline',
            'price' => 30000,
            'is_active' => true,
        ]);

        // Tạo một số tài khoản YouTube mẫu
        for ($i = 1; $i <= 3; $i++) {
            Account::create([
                'product_id' => $youtube->id,
                'username' => "youtube_user{$i}@example.com",
                'password' => "ytpassword{$i}",
                'status' => 'available',
            ]);
        }

        // Tạo sản phẩm Spotify
        $spotify = Product::create([
            'name' => 'Spotify Premium',
            'description' => 'Tài khoản Spotify Premium 1 tháng, nghe nhạc không giới hạn',
            'price' => 25000,
            'is_active' => true,
        ]);

        // Tạo một số tài khoản Spotify mẫu
        for ($i = 1; $i <= 4; $i++) {
            Account::create([
                'product_id' => $spotify->id,
                'username' => "spotify_user{$i}",
                'password' => "spotifypass{$i}",
                'status' => 'available',
            ]);
        }

        // Cập nhật available_count cho tất cả sản phẩm
        foreach (Product::all() as $product) {
            $product->update([
                'available_count' => $product->availableAccounts()->count()
            ]);
        }
    }
}
