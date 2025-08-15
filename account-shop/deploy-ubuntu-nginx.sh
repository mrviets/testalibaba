#!/bin/bash

# Deploy script cho Ubuntu + Nginx + MariaDB + PHP 8.2
echo "🚀 Deploy Account Shop lên Ubuntu + Nginx + MariaDB + PHP 8.2..."

# Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Script này cần chạy với quyền root"
    exit 1
fi

# 1. Cập nhật hệ thống
echo "📦 Cập nhật hệ thống..."
apt update && apt upgrade -y

# 2. Cài đặt các package cần thiết
echo "📥 Cài đặt packages cần thiết..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# 3. Cài đặt Nginx
echo "🌐 Cài đặt Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# 4. Cài đặt MariaDB
echo "🗄️ Cài đặt MariaDB..."
apt install -y mariadb-server mariadb-client
systemctl enable mariadb
systemctl start mariadb

# 5. Cài đặt PHP 8.2
echo "🐘 Cài đặt PHP 8.2..."
apt install -y software-properties-common
add-apt-repository ppa:ondrej/php -y
apt update
apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl php8.2-mbstring php8.2-zip php8.2-gd php8.2-bcmath php8.2-intl php8.2-redis php8.2-memcached

# 6. Cài đặt Composer
echo "📦 Cài đặt Composer..."
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# 7. Cài đặt Node.js 18
echo "📦 Cài đặt Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 8. Cài đặt PM2
echo "📦 Cài đặt PM2..."
npm install -g pm2

# 9. Cấu hình MariaDB
echo "🔒 Cấu hình MariaDB..."
mysql_secure_installation

# 10. Tạo database và user
echo "🗄️ Tạo database và user..."
mysql -u root -p -e "
CREATE DATABASE IF NOT EXISTS account_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'account_shop'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON account_shop.* TO 'account_shop'@'localhost';
FLUSH PRIVILEGES;
"

# 11. Tạo user cho ứng dụng
echo "👤 Tạo user cho ứng dụng..."
useradd -m -s /bin/bash accountshop
usermod -aG www-data accountshop

# 12. Tạo thư mục cho ứng dụng
echo "📁 Tạo thư mục ứng dụng..."
mkdir -p /var/www/dinhquocviet.space
mkdir -p /var/www/api.dinhquocviet.space
chown -R accountshop:www-data /var/www/dinhquocviet.space
chown -R accountshop:www-data /var/www/api.dinhquocviet.space
chmod -R 755 /var/www/dinhquocviet.space
chmod -R 755 /var/www/api.dinhquocviet.space

echo "✅ Cài đặt server hoàn thành!"
echo ""
echo "📋 Thông tin cài đặt:"
echo "- Nginx: http://localhost"
echo "- MariaDB: localhost:3306"
echo "- PHP: 8.2"
echo "- Node.js: $(node --version)"
echo "- Composer: $(composer --version)"
echo ""
echo "🔧 Bước tiếp theo:"
echo "1. Upload code lên server"
echo "2. Cấu hình Nginx virtual hosts"
echo "3. Cấu hình SSL certificates"
echo "4. Deploy ứng dụng"
