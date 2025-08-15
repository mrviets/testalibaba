#!/bin/bash

# Monitoring script cho Account Shop
echo "🔍 Monitoring Account Shop System..."

# 1. Kiểm tra services
echo "📊 Kiểm tra services..."
services=("nginx" "php8.2-fpm" "mariadb")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✅ $service: Running"
    else
        echo "❌ $service: Not running"
        systemctl start $service
    fi
done

# 2. Kiểm tra PM2 processes
echo "📊 Kiểm tra PM2 processes..."
if pm2 list | grep -q "account-shop-frontend"; then
    echo "✅ Frontend: Running"
else
    echo "❌ Frontend: Not running"
    cd /var/www/dinhquocviet.space && pm2 start ecosystem.config.js
fi

# 3. Kiểm tra disk space
echo "📊 Kiểm tra disk space..."
df -h | grep -E '^/dev/'

# 4. Kiểm tra memory usage
echo "📊 Kiểm tra memory usage..."
free -h

# 5. Kiểm tra database connection
echo "📊 Kiểm tra database connection..."
cd /var/www/api.dinhquocviet.space
if php artisan migrate:status > /dev/null 2>&1; then
    echo "✅ Database: Connected"
else
    echo "❌ Database: Connection failed"
fi

# 6. Kiểm tra SSL certificates
echo "📊 Kiểm tra SSL certificates..."
if certbot certificates | grep -q "VALID"; then
    echo "✅ SSL: Valid"
else
    echo "❌ SSL: Invalid or expired"
fi

# 7. Kiểm tra log files
echo "📊 Kiểm tra log files..."
log_files=(
    "/var/www/api.dinhquocviet.space/storage/logs/laravel.log"
    "/var/log/nginx/api.dinhquocviet.space.error.log"
    "/var/log/nginx/dinhquocviet.space.error.log"
    "/var/log/pm2/account-shop-frontend-error.log"
)

for log_file in "${log_files[@]}"; do
    if [ -f "$log_file" ]; then
        size=$(du -h "$log_file" | cut -f1)
        echo "📄 $log_file: $size"
        
        # Kiểm tra errors trong 1 giờ qua
        error_count=$(tail -n 1000 "$log_file" | grep -i "error\|exception\|fatal" | wc -l)
        if [ $error_count -gt 0 ]; then
            echo "⚠️  Found $error_count errors in last 1000 lines"
        fi
    else
        echo "❌ $log_file: Not found"
    fi
done

# 8. Kiểm tra SePay webhook
echo "📊 Kiểm tra SePay webhook..."
webhook_url="https://api.dinhquocviet.space/api/sepay/webhook"
if curl -s -o /dev/null -w "%{http_code}" "$webhook_url" | grep -q "200\|404"; then
    echo "✅ SePay webhook: Accessible"
else
    echo "❌ SePay webhook: Not accessible"
fi

# 9. Kiểm tra cron jobs
echo "📊 Kiểm tra cron jobs..."
if crontab -l | grep -q "artisan schedule:run"; then
    echo "✅ Laravel scheduler: Configured"
else
    echo "❌ Laravel scheduler: Not configured"
fi

echo ""
echo "✅ Monitoring completed!"
echo ""
echo "📋 Recommendations:"
echo "1. Set up automated monitoring with tools like Monit or Supervisor"
echo "2. Configure email alerts for critical errors"
echo "3. Set up backup monitoring"
echo "4. Monitor SePay webhook delivery"
