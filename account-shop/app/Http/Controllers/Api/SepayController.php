<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutoDeposit;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class SepayController extends Controller
{
    private function getSepayConfig()
    {
        return [
            'api_key' => env('SEPAY_API_KEY'),
            'secret_key' => env('SEPAY_SECRET_KEY'),
            'merchant_id' => env('SEPAY_MERCHANT_ID'),
            'base_url' => env('SEPAY_BASE_URL', 'https://api.sepay.vn/v1'),
            'webhook_url' => env('SEPAY_WEBHOOK_URL', 'https://api.dinhquocviet.space/api/sepay/webhook'),
        ];
    }

    public function createDeposit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:10000|max:50000000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Số tiền không hợp lệ. Tối thiểu 10,000 VNĐ',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $amount = $request->amount;
        $config = $this->getSepayConfig();

        // Validate SePay configuration
        if (!$config['api_key'] || !$config['secret_key'] || !$config['merchant_id']) {
            Log::error('SePay configuration missing', ['config' => $config]);
            return response()->json([
                'status' => 'error',
                'message' => 'Cấu hình thanh toán chưa hoàn thiện'
            ], 500);
        }

        // Kiểm tra rate limit
        $recentDeposits = AutoDeposit::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($recentDeposits >= 5) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn đã nạp quá nhiều lần trong 1 giờ. Vui lòng thử lại sau.'
            ], 429);
        }

        DB::beginTransaction();

        try {
            // Tạo reference code
            $referenceCode = 'NAP' . $user->id . 'T' . time() . 'R' . rand(1000, 9999);

            // Tạo lệnh nạp tiền trong database
            $autoDeposit = AutoDeposit::create([
                'user_id' => $user->id,
                'reference_code' => $referenceCode,
                'amount' => $amount,
                'bank_account' => env('BANK_ACCOUNT_NUMBER'),
                'expires_at' => now()->addMinutes(15),
                'status' => 'pending',
            ]);

            // Gọi SePay API để tạo QR code
            $sepayResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $config['api_key'],
                'Content-Type' => 'application/json',
                'X-SePay-Signature' => $this->generateSignature([
                    'merchant_id' => $config['merchant_id'],
                    'amount' => $amount,
                    'reference' => $referenceCode,
                    'description' => 'Nạp tiền Account Shop',
                    'expires_in' => 900,
                    'callback_url' => $config['webhook_url'],
                ], $config['secret_key']),
            ])->post($config['base_url'] . '/qr/create', [
                'merchant_id' => $config['merchant_id'],
                'amount' => $amount,
                'reference' => $referenceCode,
                'description' => 'Nạp tiền Account Shop',
                'expires_in' => 900, // 15 phút
                'callback_url' => $config['webhook_url'],
                'return_url' => env('FRONTEND_URL', 'https://dinhquocviet.space') . '/auto-deposit',
            ]);

            Log::info('SePay API request', [
                'url' => $config['base_url'] . '/qr/create',
                'payload' => [
                    'merchant_id' => $config['merchant_id'],
                    'amount' => $amount,
                    'reference' => $referenceCode,
                ],
                'response_status' => $sepayResponse->status(),
                'response_body' => $sepayResponse->json(),
            ]);

            if ($sepayResponse->successful()) {
                $sepayData = $sepayResponse->json();
                
                // Cập nhật QR code URL từ SePay
                $autoDeposit->update([
                    'qr_code_url' => $sepayData['qr_code_url'] ?? null,
                    'webhook_data' => $sepayData,
                ]);

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Tạo lệnh nạp tiền thành công',
                    'data' => [
                        'id' => $autoDeposit->id,
                        'reference_code' => $autoDeposit->reference_code,
                        'amount' => $autoDeposit->amount,
                        'bank_account' => $autoDeposit->bank_account,
                        'qr_code_url' => $autoDeposit->qr_code_url,
                        'expires_at' => $autoDeposit->expires_at,
                        'sepay_transaction_id' => $sepayData['transaction_id'] ?? null,
                        'instructions' => [
                            'Quét mã QR để nạp tiền',
                            'STK: ' . $autoDeposit->bank_account,
                            'Số tiền: ' . number_format($amount) . ' VNĐ',
                            'Nội dung: ' . $autoDeposit->reference_code,
                            'Lệnh hết hạn sau 15 phút'
                        ]
                    ]
                ], 201);
            } else {
                Log::error('SePay API error', [
                    'response' => $sepayResponse->json(),
                    'status' => $sepayResponse->status(),
                    'headers' => $sepayResponse->headers(),
                ]);

                DB::rollback();
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không thể tạo QR code. Vui lòng thử lại sau.'
                ], 500);
            }

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating SePay deposit', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi tạo lệnh nạp tiền'
            ], 500);
        }
    }

    public function webhook(Request $request)
    {
        Log::info('SePay webhook received', [
            'headers' => $request->headers->all(),
            'data' => $request->all(),
            'ip' => $request->ip(),
        ]);

        // Verify signature
        if (!$this->verifySignature($request)) {
            Log::error('Invalid SePay webhook signature', [
                'received_signature' => $request->header('X-SePay-Signature'),
                'payload' => $request->getContent(),
            ]);
            return response()->json(['success' => false, 'message' => 'Invalid signature'], 401);
        }

        $data = $request->all();

        // Extract transaction info
        $transactionId = $data['id'] ?? $data['transaction_id'] ?? null; // Support both formats
        $amount = $data['amount'] ?? 0;
        $reference = $data['reference'] ?? '';
        $status = $data['status'] ?? '';
        $bankCode = $data['bank_code'] ?? '';
        $accountNumber = $data['account_number'] ?? '';

        Log::info('SePay webhook data extracted', [
            'transaction_id' => $transactionId,
            'amount' => $amount,
            'reference' => $reference,
            'status' => $status,
            'bank_code' => $bankCode,
            'account_number' => $accountNumber,
        ]);

        if (!$transactionId || !$amount || !$reference || $status !== 'success') {
            Log::error('Invalid webhook data', ['data' => $data]);
            return response()->json(['success' => false, 'message' => 'Invalid data'], 400);
        }

        // Idempotency check
        $existingDeposit = AutoDeposit::where('webhook_transaction_id', $transactionId)->first();
        if ($existingDeposit) {
            Log::info('Webhook already processed', ['transaction_id' => $transactionId]);
            return response()->json(['success' => true, 'message' => 'Already processed'], 200);
        }

        // Find matching deposit
        $autoDeposit = AutoDeposit::where('reference_code', $reference)
            ->where('status', 'pending')
            ->first();

        if (!$autoDeposit) {
            Log::error('No matching deposit found', ['reference' => $reference]);
            return response()->json(['success' => false, 'message' => 'No matching deposit'], 404);
        }

        // Verify amount (allow 1-2k difference for bank fees)
        $amountDiff = abs($amount - $autoDeposit->amount);
        if ($amountDiff > 2000) {
            Log::error('Amount mismatch', [
                'expected' => $autoDeposit->amount,
                'received' => $amount,
                'difference' => $amountDiff
            ]);
            return response()->json(['success' => false, 'message' => 'Amount mismatch'], 400);
        }

        DB::beginTransaction();

        try {
            // Update auto deposit
            $autoDeposit->update([
                'status' => 'completed',
                'webhook_transaction_id' => $transactionId,
                'webhook_data' => $data,
                'completed_at' => now(),
            ]);

            // Add balance to user
            $user = $autoDeposit->user;
            $user->increment('balance', $autoDeposit->amount);

            // Create transaction record
            Transaction::create([
                'user_id' => $user->id,
                'type' => 'deposit',
                'amount' => $autoDeposit->amount,
                'description' => "Nạp tiền tự động - {$reference}",
                'status' => 'completed',
                'reference_code' => $reference,
                'processed_at' => now(),
            ]);

            DB::commit();

            Log::info('SePay deposit completed successfully', [
                'user_id' => $user->id,
                'amount' => $autoDeposit->amount,
                'reference' => $reference,
                'transaction_id' => $transactionId,
            ]);

            return response()->json(['success' => true, 'message' => 'Deposit processed'], 200);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error processing SePay deposit', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'reference' => $reference
            ]);

            return response()->json(['success' => false, 'message' => 'Processing failed'], 500);
        }
    }

    private function verifySignature(Request $request): bool
    {
        $config = $this->getSepayConfig();
        $signature = $request->header('X-SePay-Signature');
        $payload = $request->getContent();

        if (!$signature || !$payload || !$config['secret_key']) {
            Log::error('Missing signature verification data', [
                'has_signature' => !empty($signature),
                'has_payload' => !empty($payload),
                'has_secret_key' => !empty($config['secret_key']),
            ]);
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $config['secret_key']);
        $isValid = hash_equals($expectedSignature, $signature);

        Log::info('SePay signature verification', [
            'received_signature' => $signature,
            'expected_signature' => $expectedSignature,
            'is_valid' => $isValid,
        ]);

        return $isValid;
    }

    private function generateSignature(array $data, string $secretKey): string
    {
        $payload = json_encode($data);
        return hash_hmac('sha256', $payload, $secretKey);
    }

    public function checkStatus($id, Request $request)
    {
        $deposit = AutoDeposit::where('user_id', $request->user()->id)
            ->find($id);

        if (!$deposit) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lệnh nạp tiền không tồn tại'
            ], 404);
        }

        // Kiểm tra hết hạn
        if ($deposit->status === 'pending' && $deposit->isExpired()) {
            $deposit->update(['status' => 'expired']);
        }

        // Nếu có SePay transaction ID, kiểm tra trạng thái từ SePay
        if ($deposit->webhook_data && isset($deposit->webhook_data['transaction_id'])) {
            $config = $this->getSepayConfig();
            
            try {
                $sepayResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $config['api_key'],
                    'Content-Type' => 'application/json',
                ])->get($config['base_url'] . '/transaction/' . $deposit->webhook_data['transaction_id']);

                if ($sepayResponse->successful()) {
                    $transactionData = $sepayResponse->json();
                    Log::info('SePay transaction status check', [
                        'transaction_id' => $deposit->webhook_data['transaction_id'],
                        'status' => $transactionData['status'] ?? 'unknown',
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Error checking SePay transaction status', [
                    'error' => $e->getMessage(),
                    'transaction_id' => $deposit->webhook_data['transaction_id'] ?? null,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $deposit
        ]);
    }

    public function getTransactionHistory(Request $request)
    {
        $user = $request->user();
        $deposits = AutoDeposit::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $deposits
        ]);
    }

    /**
     * Generate SePay QR URL for personal accounts (no Merchant ID required)
     */
    public static function generateSepayQR(string $accountNumber, string $bankCode, ?float $amount = null, ?string $description = null): string
    {
        $baseUrl = 'https://qr.sepay.vn/img';
        $params = [
            'acc' => $accountNumber,
            'bank' => $bankCode,
        ];

        if ($amount) {
            $params['amount'] = $amount;
        }

        if ($description) {
            $params['des'] = $description;
        }

        $queryString = http_build_query($params);
        return "{$baseUrl}?{$queryString}";
    }

    /**
     * Create deposit with SePay QR (personal account method)
     */
    public function createDepositPersonal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:10000|max:50000000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Số tiền không hợp lệ. Tối thiểu 10,000 VNĐ',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $amount = $request->amount;

        // Kiểm tra rate limit
        $recentDeposits = AutoDeposit::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($recentDeposits >= 5) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn đã nạp quá nhiều lần trong 1 giờ. Vui lòng thử lại sau.'
            ], 429);
        }

        DB::beginTransaction();

        try {
            // Tạo reference code
            $referenceCode = 'NAP' . $user->id . 'T' . time() . 'R' . rand(1000, 9999);

            // Tạo lệnh nạp tiền trong database
            $autoDeposit = AutoDeposit::create([
                'user_id' => $user->id,
                'reference_code' => $referenceCode,
                'amount' => $amount,
                'bank_account' => env('BANK_ACCOUNT_NUMBER'),
                'expires_at' => now()->addMinutes(15),
                'status' => 'pending',
            ]);

            // Tạo SePay QR URL (personal account method)
            $qrUrl = self::generateSepayQR(
                env('BANK_ACCOUNT_NUMBER'),
                env('BANK_CODE', '970422'),
                $amount,
                $referenceCode
            );

            $autoDeposit->update([
                'qr_code_url' => $qrUrl,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo lệnh nạp tiền thành công',
                'data' => [
                    'id' => $autoDeposit->id,
                    'reference_code' => $autoDeposit->reference_code,
                    'amount' => $autoDeposit->amount,
                    'bank_account' => $autoDeposit->bank_account,
                    'qr_code_url' => $autoDeposit->qr_code_url,
                    'expires_at' => $autoDeposit->expires_at,
                    'instructions' => [
                        'Quét mã QR để nạp tiền',
                        'STK: ' . $autoDeposit->bank_account,
                        'Số tiền: ' . number_format($amount) . ' VNĐ',
                        'Nội dung: ' . $autoDeposit->reference_code,
                        'Lệnh hết hạn sau 15 phút'
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating SePay deposit (personal)', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi tạo lệnh nạp tiền'
            ], 500);
        }
    }
}


