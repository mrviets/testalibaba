# 🔧 HƯỚNG DẪN CẤU HÌNH SEPAY CHO ACCOUNT SHOP

## 📋 **TỔNG QUAN**

SePay là cổng thanh toán VietQR tự động cho phép người dùng nạp tiền thông qua quét mã QR hoặc chuyển khoản thủ công. Hệ thống sẽ tự động cộng tiền vào tài khoản người dùng sau khi nhận được webhook từ SePay.

---

## 🚀 **BƯỚC 1: ĐĂNG KÝ TÀI KHOẢN SEPAY**

### **1.1 Truy cập website SePay**
- Website: https://sepay.vn
- Đăng ký tài khoản merchant

### **1.2 Xác thực tài khoản**
- Cung cấp thông tin doanh nghiệp
- Upload giấy phép kinh doanh
- Xác thực tài khoản ngân hàng

### **1.3 Lấy thông tin API**
Sau khi được duyệt, bạn sẽ nhận được:
- **API Key**: Khóa API để gọi các endpoint
- **Secret Key**: Khóa bí mật để xác thực webhook
- **Merchant ID**: ID của merchant

---

## ⚙️ **BƯỚC 2: CẤU HÌNH MÔI TRƯỜNG**

### **2.1 Cập nhật file .env**

```bash
# SePay API Configuration
SEPAY_API_KEY=your_sepay_api_key_here
SEPAY_SECRET_KEY=your_sepay_secret_key_here
SEPAY_MERCHANT_ID=your_merchant_id_here
SEPAY_BASE_URL=https://api.sepay.vn/v1

# SePay Webhook Configuration
SEPAY_WEBHOOK_URL=https://api.dinhquocviet.space/api/sepay/webhook

# Bank Account Configuration
BANK_ACCOUNT_NUMBER=1234567890
BANK_ACCOUNT_NAME=ACCOUNT SHOP
BANK_CODE=970422

# Frontend URL for return redirects
FRONTEND_URL=https://dinhquocviet.space

# Security Configuration
DEPOSIT_RATE_LIMIT=5
DEPOSIT_RATE_LIMIT_WINDOW=3600
MIN_DEPOSIT_AMOUNT=10000
MAX_DEPOSIT_AMOUNT=50000000
DEPOSIT_EXPIRATION_MINUTES=15
AMOUNT_TOLERANCE=2000
```

### **2.2 Cấu hình cho môi trường production**

```bash
# Production .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.dinhquocviet.space

# SePay Production URLs
SEPAY_WEBHOOK_URL=https://api.dinhquocviet.space/api/sepay/webhook
FRONTEND_URL=https://dinhquocviet.space
```

---

## 🔧 **BƯỚC 3: KIỂM TRA KẾT NỐI**

### **3.1 Chạy command test**

```bash
# Test kết nối SePay API
php artisan sepay:test

# Test với số tiền cụ thể
php artisan sepay:test --amount=50000
```

### **3.2 Kiểm tra logs**

```bash
# Xem logs SePay
tail -f storage/logs/laravel.log | grep -i sepay
```

---

## 🌐 **BƯỚC 4: CẤU HÌNH WEBHOOK**

### **4.1 Cấu hình webhook URL trong SePay Dashboard**

1. Đăng nhập vào SePay Dashboard
2. Vào phần **Webhook Settings**
3. Cấu hình webhook URL: `https://api.dinhquocviet.space/api/sepay/webhook`
4. Chọn events: `payment.success`
5. Lưu cấu hình

### **4.2 Test webhook**

```bash
# Tạo test webhook
curl -X POST https://api.dinhquocviet.space/api/sepay/webhook \
  -H "Content-Type: application/json" \
  -H "X-SePay-Signature: test_signature" \
  -d '{
    "transaction_id": "test_123",
    "amount": 10000,
    "reference": "TEST123",
    "status": "success"
  }'
```

---

## 🔒 **BƯỚC 5: BẢO MẬT**

### **5.1 SSL Certificate**
- Bắt buộc có SSL certificate cho webhook URL
- SePay chỉ gửi webhook qua HTTPS

### **5.2 IP Whitelist (Tùy chọn)**
- Cấu hình IP whitelist trong SePay Dashboard
- Chỉ cho phép webhook từ IP của SePay

### **5.3 Signature Verification**
- Hệ thống đã tự động verify signature
- Không cần cấu hình thêm

---

## 📊 **BƯỚC 6: MONITORING**

### **6.1 Logs**
```bash
# Xem logs real-time
tail -f storage/logs/laravel.log

# Filter SePay logs
grep "SePay" storage/logs/laravel.log
```

### **6.2 Database Monitoring**
```sql
-- Xem các giao dịch SePay
SELECT * FROM auto_deposits WHERE webhook_data IS NOT NULL;

-- Xem thống kê theo ngày
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_deposits,
    SUM(amount) as total_amount,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_deposits
FROM auto_deposits 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🚨 **XỬ LÝ LỖI THƯỜNG GẶP**

### **Lỗi 1: "Invalid signature"**
```bash
# Kiểm tra secret key
echo $SEPAY_SECRET_KEY

# Kiểm tra webhook payload
tail -f storage/logs/laravel.log | grep "webhook received"
```

### **Lỗi 2: "API connection failed"**
```bash
# Kiểm tra API key
echo $SEPAY_API_KEY

# Test API connection
php artisan sepay:test
```

### **Lỗi 3: "Amount mismatch"**
```bash
# Kiểm tra amount tolerance
echo $AMOUNT_TOLERANCE

# Xem webhook data
tail -f storage/logs/laravel.log | grep "Amount mismatch"
```

### **Lỗi 4: "No matching deposit found"**
```bash
# Kiểm tra reference code
SELECT * FROM auto_deposits WHERE reference_code = 'REFERENCE_CODE';

# Xem webhook data
tail -f storage/logs/laravel.log | grep "No matching deposit"
```

---

## 📞 **HỖ TRỢ**

### **SePay Support**
- Email: support@sepay.vn
- Hotline: 1900-xxxx
- Documentation: https://docs.sepay.vn

### **Technical Issues**
- Kiểm tra logs: `storage/logs/laravel.log`
- Test connection: `php artisan sepay:test`
- Monitor webhook: Real-time logs

---

## ✅ **CHECKLIST TRIỂN KHAI**

- [ ] Đăng ký tài khoản SePay merchant
- [ ] Nhận API Key, Secret Key, Merchant ID
- [ ] Cấu hình biến môi trường trong .env
- [ ] Test kết nối API: `php artisan sepay:test`
- [ ] Cấu hình webhook URL trong SePay Dashboard
- [ ] Test webhook signature verification
- [ ] Cấu hình SSL certificate cho production
- [ ] Monitor logs và database
- [ ] Test end-to-end flow với số tiền nhỏ

---

## 🔄 **LUỒNG HOẠT ĐỘNG**

1. **User tạo lệnh nạp tiền**
   - Frontend gọi API: `POST /api/sepay/deposit`
   - Backend tạo record trong `auto_deposits`
   - Gọi SePay API để tạo QR code
   - Trả về QR code URL cho user

2. **User thanh toán**
   - User quét QR code hoặc chuyển khoản thủ công
   - SePay xử lý thanh toán
   - SePay gửi webhook đến backend

3. **Backend xử lý webhook**
   - Verify signature
   - Tìm deposit record theo reference code
   - Verify amount
   - Cộng tiền vào tài khoản user
   - Tạo transaction record
   - Cập nhật trạng thái deposit

4. **User nhận thông báo**
   - Frontend poll trạng thái: `GET /api/sepay/deposit/{id}/status`
   - Hiển thị thông báo thành công
   - Cập nhật số dư tài khoản
