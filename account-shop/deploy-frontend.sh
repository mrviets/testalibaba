#!/bin/bash

# Deploy Frontend Next.js
echo "🚀 Deploy Frontend Next.js..."

# Kiểm tra thư mục
if [ ! -f "package.json" ]; then
    echo "❌ Không tìm thấy package.json. Hãy chạy script trong thư mục Next.js."
    exit 1
fi

# 1. Tạo file .env.local production
echo "⚙️ Tạo file .env.local production..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api.dinhquocviet.space
NODE_ENV=production
EOF

# 2. Cài đặt dependencies
echo "📥 Cài đặt npm dependencies..."
npm ci --production

# 3. Build production
echo "🔨 Build production..."
npm run build

# 4. Tạo PM2 ecosystem file
echo "📦 Tạo PM2 ecosystem file..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'account-shop-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/dinhquocviet.space',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/account-shop-frontend-error.log',
    out_file: '/var/log/pm2/account-shop-frontend-out.log',
    log_file: '/var/log/pm2/account-shop-frontend-combined.log',
    time: true
  }]
};
EOF

# 5. Tạo thư mục logs
echo "📁 Tạo thư mục logs..."
sudo mkdir -p /var/log/pm2
sudo chown accountshop:accountshop /var/log/pm2

# 6. Khởi động với PM2
echo "🚀 Khởi động với PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 7. Cấu hình quyền thư mục
echo "🔒 Cấu hình quyền thư mục..."
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod +x .next/standalone/server.js

echo ""
echo "✅ Deploy Frontend hoàn thành!"
echo ""
echo "📋 Checklist sau deploy:"
echo "1. ✅ Dependencies đã được cài đặt"
echo "2. ✅ Production build đã được tạo"
echo "3. ✅ PM2 process đã được khởi động"
echo "4. ✅ Quyền thư mục đã được cấu hình"
echo ""
echo "🔧 Bước tiếp theo:"
echo "1. Kiểm tra PM2 status: pm2 status"
echo "2. Xem logs: pm2 logs account-shop-frontend"
echo "3. Cấu hình Nginx proxy"
echo ""
echo "🌐 Truy cập:"
echo "- Frontend: https://dinhquocviet.space"
echo "- PM2 Dashboard: pm2 monit"
echo ""
echo "📝 Ghi chú:"
echo "- PM2 logs: /var/log/pm2/"
echo "- Restart: pm2 restart account-shop-frontend"
echo "- Stop: pm2 stop account-shop-frontend"
