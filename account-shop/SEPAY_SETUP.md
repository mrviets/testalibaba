# 🔧 HƯỚNG DẪN CẤU HÌNH SEPAY CHO ACCOUNT SHOP

## 📋 **TỔNG QUAN**

SePay là cổng thanh toán VietQR tự động cho phép người dùng nạp tiền thông qua quét mã QR hoặc chuyển khoản thủ công. Hệ thống hỗ trợ 2 phương pháp:

1. **Tài khoản Merchant** (cần Merchant ID, API Key, Secret Key)
2. **Tài khoản Cá nhân** (chỉ cần số tài khoản và mã ngân hàng)

---

## 🚀 **BƯỚC 1: CHỌN PHƯƠNG PHÁP**

### **1.1 Tài khoản Merchant (Khuyến nghị cho Production)**
- Website: https://sepay.vn
- Đăng ký tài khoản merchant
- Xác thực doanh nghiệp
- Nhận API Key, Secret Key, Merchant ID

### **1.2 Tài khoản Cá nhân (Cho Development/Testing)**
- Không cần đăng ký merchant
- Chỉ cần số tài khoản ngân hàng và mã ngân hàng
- QR code được tạo theo format: `https://qr.sepay.vn/img?acc=...&bank=...`

---

## ⚙️ **BƯỚC 2: CẤU HÌNH MÔI TRƯỜNG**

### **2.1 Cấu hình cho Merchant Account**

```bash
# SePay API Configuration (Merchant)
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

### **2.2 Cấu hình cho Personal Account**

```bash
# SePay Personal Account Configuration
BANK_ACCOUNT_NUMBER=1234567890
BANK_ACCOUNT_NAME=ACCOUNT SHOP
BANK_CODE=970422

# Webhook Configuration (vẫn cần cho personal account)
SEPAY_WEBHOOK_URL=https://api.dinhquocviet.space/api/sepay/webhook

# Frontend URL
FRONTEND_URL=https://dinhquocviet.space

# Security Configuration
DEPOSIT_RATE_LIMIT=5
DEPOSIT_RATE_LIMIT_WINDOW=3600
MIN_DEPOSIT_AMOUNT=10000
MAX_DEPOSIT_AMOUNT=50000000
DEPOSIT_EXPIRATION_MINUTES=15
AMOUNT_TOLERANCE=2000
```

---

## 🔧 **BƯỚC 3: SỬ DỤNG API**

### **3.1 Merchant Account API**

```bash
# Tạo deposit với Merchant account
POST /api/sepay/deposit
{
    "amount": 100000
}

# Response
{
    "status": "success",
    "data": {
        "qr_code_url": "https://api.sepay.vn/qr/...",
        "reference_code": "NAP123T1234567890R1234"
    }
}
```

### **3.2 Personal Account API**

```bash
# Tạo deposit với Personal account
POST /api/sepay/deposit-personal
{
    "amount": 100000
}

# Response
{
    "status": "success",
    "data": {
        "qr_code_url": "https://qr.sepay.vn/img?acc=1234567890&bank=970422&amount=100000&des=NAP123T1234567890R1234",
        "reference_code": "NAP123T1234567890R1234"
    }
}
```

---

## 🌐 **BƯỚC 4: CẤU HÌNH WEBHOOK**

### **4.1 Webhook URL**
Cả hai phương pháp đều sử dụng cùng webhook endpoint:
```
https://api.dinhquocviet.space/api/sepay/webhook
```

### **4.2 Webhook Payload Format**
SePay gửi webhook với format:
```json
{
    "id": "transaction_123",
    "amount": 100000,
    "reference": "NAP123T1234567890R1234",
    "status": "success",
    "bank_code": "970422",
    "account_number": "1234567890"
}
```

### **4.3 Response Format**
Backend phải trả về đúng format SePay yêu cầu:
```json
{
    "success": true,
    "message": "Deposit processed"
}
```

---

## 🔒 **BƯỚC 5: BẢO MẬT**

### **5.1 SSL Certificate**
- Bắt buộc có SSL certificate cho webhook URL
- SePay chỉ gửi webhook qua HTTPS

### **5.2 Signature Verification (Merchant Account)**
- Hệ thống tự động verify signature với Secret Key
- Không cần cấu hình thêm

### **5.3 Idempotency**
- Hệ thống tự động check trùng lặp theo transaction ID
- Đảm bảo không xử lý webhook trùng lặp

---

## 📊 **BƯỚC 6: MONITORING**

### **6.1 Logs**
```bash
# Xem logs real-time
tail -f storage/logs/laravel.log

# Filter SePay logs
grep "SePay" storage/logs/laravel.log
```

### **6.2 Test Commands**
```bash
# Test Merchant account
php artisan sepay:test --amount=10000

# Test Personal account (manual)
curl -X POST https://api.dinhquocviet.space/api/sepay/deposit-personal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 10000}'
```

---

## 🚨 **XỬ LÝ LỖI THƯỜNG GẶP**

### **Lỗi 1: "Invalid signature" (Merchant Account)**
```bash
# Kiểm tra secret key
echo $SEPAY_SECRET_KEY

# Kiểm tra webhook payload
tail -f storage/logs/laravel.log | grep "webhook received"
```

### **Lỗi 2: "QR code not working" (Personal Account)**
```bash
# Kiểm tra bank code
echo $BANK_CODE

# Test QR URL
curl -I "https://qr.sepay.vn/img?acc=1234567890&bank=970422&amount=10000"
```

### **Lỗi 3: "Response format error"**
```bash
# Kiểm tra webhook response
tail -f storage/logs/laravel.log | grep "webhook response"
```

---

## 📞 **HỖ TRỢ**

### **SePay Support**
- Email: support@sepay.vn
- Documentation: https://docs.sepay.vn

### **Technical Issues**
- Kiểm tra logs: `storage/logs/laravel.log`
- Test connection: `php artisan sepay:test`
- Monitor webhook: Real-time logs

---

## ✅ **CHECKLIST TRIỂN KHAI**

### **Merchant Account:**
- [ ] Đăng ký tài khoản SePay merchant
- [ ] Nhận API Key, Secret Key, Merchant ID
- [ ] Cấu hình biến môi trường trong .env
- [ ] Test kết nối API: `php artisan sepay:test`
- [ ] Cấu hình webhook URL trong SePay Dashboard
- [ ] Test webhook signature verification

### **Personal Account:**
- [ ] Cấu hình BANK_ACCOUNT_NUMBER và BANK_CODE
- [ ] Test QR code generation
- [ ] Cấu hình webhook URL (nếu có)
- [ ] Test end-to-end flow

### **Chung:**
- [ ] Cấu hình SSL certificate cho production
- [ ] Monitor logs và database
- [ ] Test end-to-end flow với số tiền nhỏ

---

## 🔄 **LUỒNG HOẠT ĐỘNG**

### **Merchant Account:**
1. User tạo lệnh nạp tiền → Backend gọi SePay API → Tạo QR code
2. User quét QR → SePay xử lý → Gửi webhook → Backend cộng tiền

### **Personal Account:**
1. User tạo lệnh nạp tiền → Backend tạo QR URL → Hiển thị QR
2. User quét QR → Chuyển khoản thủ công → Backend check status → Cộng tiền

### **Webhook Processing (Chung):**
1. SePay gửi webhook với payload JSON
2. Backend verify signature (nếu có)
3. Check idempotency theo transaction ID
4. Tìm deposit record theo reference code
5. Verify amount và cộng tiền
6. Trả về `{"success": true}` với HTTP 200
