#!/bin/bash

# Deploy Backend Laravel
echo "🚀 Deploy Backend Laravel..."

# Kiểm tra thư mục
if [ ! -f "composer.json" ]; then
    echo "❌ Không tìm thấy composer.json. Hãy chạy script trong thư mục Laravel."
    exit 1
fi

# 1. Tạo file .env production
echo "⚙️ Tạo file .env production..."
cat > .env << 'EOF'
APP_NAME="Account Shop"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.dinhquocviet.space

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=account_shop
DB_USERNAME=account_shop
DB_PASSWORD=EY6xX3y8QvxCQgfyfvWQ

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@dinhquocviet.space"
MAIL_FROM_NAME="Account Shop"

# Webhook Configuration (vẫn cần cho personal account)

SEPAY_WEBHOOK_URL=https://api.dinhquocviet.space/api/sepay/webhook

# SePay Personal Account Configuration
BANK_ACCOUNT_NUMBER=86853888888
BANK_ACCOUNT_NAME="DINH QUOC VIET"
BANK_CODE=970423

# Frontend URL
FRONTEND_URL=https://dinhquocviet.space

# Security Configuration
# Security Configuration
DEPOSIT_RATE_LIMIT=5
DEPOSIT_RATE_LIMIT_WINDOW=3600
MIN_DEPOSIT_AMOUNT=10000
MAX_DEPOSIT_AMOUNT=50000000
DEPOSIT_EXPIRATION_MINUTES=15
AMOUNT_TOLERANCE=2000
EOF

# 2. Cài đặt dependencies
echo "📥 Cài đặt Composer dependencies..."
composer install --optimize-autoloader --no-dev --no-interaction

# 3. Generate key nếu cần
if grep -q "APP_KEY=$" .env || grep -q "APP_KEY=base64:$" .env; then
    echo "🔑 Generate application key..."
    php artisan key:generate --force
fi

# 4. Kiểm tra kết nối database
echo "🔍 Kiểm tra kết nối database..."
php artisan migrate:status 2>/dev/null || {
    echo "❌ Không thể kết nối database. Kiểm tra thông tin trong .env"
    exit 1
}

# 5. Chạy migrations
echo "🗄️ Chạy database migrations..."
php artisan migrate --force

# 6. Seed dữ liệu mẫu
echo "🌱 Seed dữ liệu mẫu..."
php artisan db:seed --class=ProductSeeder --force

# 7. Cấu hình quyền thư mục
echo "🔒 Cấu hình quyền thư mục..."
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod -R 775 storage
chmod -R 775 bootstrap/cache
chmod 644 .env

# 8. Optimize cho production
echo "⚡ Optimize cho production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 9. Clear cache cũ
php artisan cache:clear

# 10. Tạo symlink cho storage
if [ ! -L "public/storage" ]; then
    echo "🔗 Tạo storage symlink..."
    php artisan storage:link
fi

# 11. Test SePay connection
echo "🧪 Test SePay connection..."
php artisan sepay:test --amount=10000

echo ""
echo "✅ Deploy Backend hoàn thành!"
echo ""
echo "📋 Checklist sau deploy:"
echo "1. ✅ Database đã được migrate"
echo "2. ✅ Dữ liệu mẫu đã được seed"
echo "3. ✅ Cache đã được optimize"
echo "4. ✅ Quyền thư mục đã được cấu hình"
echo "5. ✅ SePay connection đã được test"
echo ""
echo "🔧 Bước tiếp theo:"
echo "1. Tạo admin user: php artisan make:filament-user"
echo "2. Cấu hình cron jobs"
echo "3. Setup monitoring"
echo ""
echo "🌐 Truy cập:"
echo "- API: https://api.dinhquocviet.space"
echo "- Admin Panel: https://api.dinhquocviet.space/admin"
echo ""
echo "📝 Ghi chú:"
echo "- Log file: storage/logs/laravel.log"
echo "- Cấu hình cron: * * * * * cd /var/www/api.dinhquocviet.space && php artisan schedule:run >> /dev/null 2>&1"
