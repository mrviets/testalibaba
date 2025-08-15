<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Account;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductWithToolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update existing products with images and types
        $this->updateExistingProducts();

        // Create new tool products
        $this->createToolProducts();
    }

    private function updateExistingProducts()
    {
        $updates = [
            'Netflix Premium' => [
                'image_url' => 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop&crop=center',
                'product_type' => 'account',
                'description' => 'Tài khoản Netflix Premium 1 tháng với chất lượng 4K Ultra HD'
            ],
            'Spotify Premium' => [
                'image_url' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center',
                'product_type' => 'account',
                'description' => 'Tài khoản Spotify Premium 1 tháng, nghe nhạc không quảng cáo'
            ],
            'YouTube Premium' => [
                'image_url' => 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop&crop=center',
                'product_type' => 'account',
                'description' => 'Tài khoản YouTube Premium 1 tháng, xem video không quảng cáo'
            ],
        ];

        foreach ($updates as $name => $data) {
            Product::where('name', 'like', "%{$name}%")->update($data);
        }
    }

    private function createToolProducts()
    {
        // Tool 1: ElevenLabs Voice Cloning
        $elevenLabs = Product::create([
            'name' => 'Tools ElevenLabs Voice Cloning Pro',
            'description' => 'Tool tự động chuyển văn bản thành giọng nói với AI ElevenLabs. Hỗ trợ nhiều giọng, clone voice, xuất file MP3/WAV.',
            'price' => 550000,
            'image_url' => 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=300&fit=crop&crop=center',
            'product_type' => 'tool',
            'is_active' => true,
            'available_count' => 0,
            'tutorial_content' => "HƯỚNG DẪN SỬ DỤNG ELEVENLABS VOICE CLONING PRO

🎯 TÍNH NĂNG CHÍNH:
- Chuyển văn bản thành giọng nói tự nhiên
- Clone giọng nói từ file audio mẫu
- Hỗ trợ 29+ ngôn ngữ khác nhau
- Xuất file MP3, WAV chất lượng cao
- Batch processing - xử lý hàng loạt
- Giao diện đơn giản, dễ sử dụng

📋 CÁCH SỬ DỤNG:

Bước 1: Cài đặt và đăng nhập
- Tải tool về và giải nén
- Chạy file ElevenLabsPro.exe
- Nhập API key ElevenLabs (có sẵn trong tool)
- Click 'Connect' để kết nối

Bước 2: Chọn giọng nói
- Tab 'Voices' -> chọn giọng có sẵn
- Hoặc tab 'Clone Voice' -> upload file audio mẫu
- Preview giọng trước khi sử dụng

Bước 3: Chuyển đổi văn bản
- Paste văn bản vào ô 'Text Input'
- Chọn giọng nói và ngôn ngữ
- Điều chỉnh Speed, Pitch nếu cần
- Click 'Generate' để tạo audio

Bước 4: Xuất file
- Preview audio trước khi lưu
- Chọn format: MP3 hoặc WAV
- Click 'Export' để lưu file

🔥 TÍNH NĂNG NÂNG CAO:
- Batch Mode: Xử lý nhiều văn bản cùng lúc
- Voice Mixing: Trộn nhiều giọng nói
- Audio Effects: Thêm hiệu ứng âm thanh
- Auto Subtitle: Tự động tạo phụ đề

💡 TIPS SỬ DỤNG:
- Văn bản ngắn (< 500 từ) cho kết quả tốt nhất
- Sử dụng dấu câu để giọng nói tự nhiên hơn
- Clone voice cần file audio ít nhất 30 giây
- Lưu project để sử dụng lại sau",
            'tutorial_video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'tutorial_steps' => [
                'Tải tool về máy và giải nén file ZIP',
                'Chạy ElevenLabsPro.exe với quyền Administrator',
                'Nhập API key có sẵn trong file hướng dẫn',
                'Chọn giọng nói từ thư viện hoặc clone giọng mới',
                'Paste văn bản cần chuyển đổi vào ô Text Input',
                'Điều chỉnh các thông số Speed, Pitch, Stability',
                'Click Generate để tạo audio và preview',
                'Xuất file MP3/WAV về máy để sử dụng'
            ]
        ]);

        // Add sample accounts for ElevenLabs
        for ($i = 1; $i <= 5; $i++) {
            Account::create([
                'product_id' => $elevenLabs->id,
                'username' => "elevenlabs_user{$i}@tool.com",
                'password' => "ElevenPass{$i}23",
                'account_data' => "elevenlabs_user{$i}@tool.com|ElevenPass{$i}23|API_KEY_INCLUDED|PREMIUM_FEATURES",
                'status' => 'available'
            ]);
        }

        // Tool 2: Instagram Auto Engagement
        $instaBot = Product::create([
            'name' => 'Instagram Auto Engagement Bot',
            'description' => 'Bot tự động tương tác Instagram: auto like, follow, comment, DM. Tăng follower và engagement tự nhiên.',
            'price' => 350000,
            'image_url' => 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=300&fit=crop&crop=center',
            'product_type' => 'tool',
            'is_active' => true,
            'available_count' => 0,
            'tutorial_content' => "HƯỚNG DẪN SỬ DỤNG INSTAGRAM AUTO ENGAGEMENT BOT

🎯 TÍNH NĂNG CHÍNH:
- Auto Like posts theo hashtag/location
- Auto Follow/Unfollow users
- Auto Comment với template có sẵn
- Auto DM (Direct Message)
- Schedule posts tự động
- Analytics và báo cáo chi tiết

⚠️ LƯU Ý AN TOÀN:
- Sử dụng proxy để tránh bị phát hiện
- Giới hạn actions/hour để tránh spam
- Không sử dụng trên tài khoản chính
- Backup dữ liệu thường xuyên

📋 CÁCH SỬ DỤNG:

Bước 1: Setup tài khoản
- Mở InstagramBot.exe
- Nhập username/password Instagram
- Cấu hình proxy (khuyến nghị)
- Test connection

Bước 2: Cấu hình Auto Like
- Tab 'Auto Like' -> bật chức năng
- Nhập hashtags target (#fashion #beauty)
- Set limit: 50-100 likes/hour
- Chọn thời gian hoạt động

Bước 3: Cấu hình Auto Follow
- Tab 'Auto Follow' -> set target users
- Follow từ hashtag hoặc competitor
- Limit: 20-50 follows/hour
- Auto unfollow sau X ngày

Bước 4: Auto Comment
- Tab 'Comments' -> thêm template
- Ví dụ: 'Nice post! 😍', 'Amazing! 🔥'
- Random comment để tự nhiên
- Limit: 10-20 comments/hour

🔥 TÍNH NĂNG NÂNG CAO:
- Smart targeting theo độ tuổi, giới tính
- Blacklist để tránh spam cùng user
- Schedule hoạt động theo giờ
- Export data ra Excel

💡 TIPS TĂNG HIỆU QUẢ:
- Sử dụng hashtag niche, ít cạnh tranh
- Comment có ý nghĩa, không spam
- Tương tác với follower thật
- Đăng content chất lượng thường xuyên",
            'tutorial_video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'tutorial_steps' => [
                'Download và cài đặt Instagram Bot',
                'Tạo tài khoản Instagram phụ để test',
                'Cấu hình proxy để bảo mật (khuyến nghị)',
                'Đăng nhập vào tool với tài khoản Instagram',
                'Setup Auto Like với hashtag target',
                'Cấu hình Auto Follow/Unfollow',
                'Tạo template comment tự nhiên',
                'Chạy bot và monitor kết quả'
            ]
        ]);

        // Add sample accounts for Instagram Bot
        for ($i = 1; $i <= 8; $i++) {
            Account::create([
                'product_id' => $instaBot->id,
                'username' => "instabot_license{$i}",
                'password' => "InstaBot{$i}Pass",
                'account_data' => "instabot_license{$i}|InstaBot{$i}Pass|LICENSE_KEY_INCLUDED|PROXY_SETUP_GUIDE",
                'status' => 'available'
            ]);
        }

        // Tool 3: YouTube SEO Optimizer
        $ytSeo = Product::create([
            'name' => 'YouTube SEO Optimizer Pro',
            'description' => 'Tool tối ưu SEO YouTube: tìm keyword, tạo title/description, phân tích competitor, tăng view tự nhiên.',
            'price' => 450000,
            'image_url' => 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop&crop=center',
            'product_type' => 'tool',
            'is_active' => true,
            'available_count' => 0,
            'tutorial_content' => "HƯỚNG DẪN SỬ DỤNG YOUTUBE SEO OPTIMIZER PRO

🎯 TÍNH NĂNG CHÍNH:
- Keyword Research cho YouTube
- Tạo Title/Description tối ưu SEO
- Phân tích competitor videos
- Suggest tags hiệu quả
- Track ranking keywords
- Báo cáo analytics chi tiết

📋 CÁCH SỬ DỤNG:

Bước 1: Keyword Research
- Tab 'Keywords' -> nhập chủ đề video
- Tool sẽ suggest keywords liên quan
- Xem search volume, competition
- Chọn keywords có potential cao

Bước 2: Tối ưu Title
- Tab 'Title Generator'
- Nhập main keyword
- Tool tạo 10+ title suggestions
- Chọn title có CTR cao nhất

Bước 3: Tạo Description
- Tab 'Description' -> paste video info
- Tool tự động tạo description SEO
- Include keywords tự nhiên
- Thêm call-to-action

Bước 4: Chọn Tags
- Tab 'Tags' -> nhập video topic
- Tool suggest 20+ relevant tags
- Mix popular và niche tags
- Copy tags vào YouTube Studio

🔥 TÍNH NĂNG NÂNG CAO:
- Competitor Analysis: phân tích video đối thủ
- Trending Topics: chủ đề đang hot
- Thumbnail Analyzer: đánh giá thumbnail
- Upload Scheduler: lên lịch đăng video

💡 TIPS TĂNG VIEW:
- Chọn keywords có search volume 1K-10K
- Title dài 60-70 ký tự
- Description ít nhất 200 từ
- Sử dụng 10-15 tags relevant
- Đăng video vào giờ vàng (19-22h)",
            'tutorial_video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'tutorial_steps' => [
                'Cài đặt YouTube SEO Optimizer Pro',
                'Kết nối với YouTube API (hướng dẫn có sẵn)',
                'Research keywords cho niche của bạn',
                'Tạo title tối ưu với keyword chính',
                'Generate description SEO-friendly',
                'Chọn tags mix popular và long-tail',
                'Phân tích competitor để học hỏi',
                'Upload video và track performance'
            ]
        ]);

        // Add sample accounts for YouTube SEO
        for ($i = 1; $i <= 6; $i++) {
            Account::create([
                'product_id' => $ytSeo->id,
                'username' => "ytseo_pro{$i}@tool.com",
                'password' => "YTSeo{$i}Pro",
                'account_data' => "ytseo_pro{$i}@tool.com|YTSeo{$i}Pro|API_ACCESS_INCLUDED|PREMIUM_FEATURES",
                'status' => 'available'
            ]);
        }

        // Update available_count for all products
        Product::all()->each(function ($product) {
            $product->update([
                'available_count' => $product->accounts()->where('status', 'available')->count()
            ]);
        });
    }
}
