<?php

namespace App\Services;

use App\Models\AutoDeposit;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SepayService
{
    private array $config;

    public function __construct()
    {
        $this->config = [
            'api_key' => env('SEPAY_API_KEY'),
            'secret_key' => env('SEPAY_SECRET_KEY'),
            'merchant_id' => env('SEPAY_MERCHANT_ID'),
            'base_url' => env('SEPAY_BASE_URL', 'https://api.sepay.vn/v1'),
            'webhook_url' => env('SEPAY_WEBHOOK_URL', 'https://api.dinhquocviet.space/api/sepay/webhook'),
        ];
    }

    public function createDeposit(User $user, float $amount): array
    {
        // Validate configuration
        $this->validateConfiguration();

        // Generate reference code
        $referenceCode = $this->generateReferenceCode($user->id);

        // Create deposit record
        $autoDeposit = AutoDeposit::create([
            'user_id' => $user->id,
            'reference_code' => $referenceCode,
            'amount' => $amount,
            'bank_account' => env('BANK_ACCOUNT_NUMBER'),
            'expires_at' => now()->addMinutes(env('DEPOSIT_EXPIRATION_MINUTES', 15)),
            'status' => 'pending',
        ]);

        // Call SePay API
        $sepayResponse = $this->callSepayAPI($referenceCode, $amount);

        if ($sepayResponse['success']) {
            $autoDeposit->update([
                'qr_code_url' => $sepayResponse['data']['qr_code_url'] ?? null,
                'webhook_data' => $sepayResponse['data'],
            ]);

            return [
                'success' => true,
                'data' => [
                    'id' => $autoDeposit->id,
                    'reference_code' => $autoDeposit->reference_code,
                    'amount' => $autoDeposit->amount,
                    'bank_account' => $autoDeposit->bank_account,
                    'qr_code_url' => $autoDeposit->qr_code_url,
                    'expires_at' => $autoDeposit->expires_at,
                    'sepay_transaction_id' => $sepayResponse['data']['transaction_id'] ?? null,
                ]
            ];
        }

        // Rollback if SePay API failed
        $autoDeposit->delete();
        
        return [
            'success' => false,
            'error' => $sepayResponse['error'] ?? 'Không thể tạo QR code'
        ];
    }

    public function processWebhook(array $webhookData): array
    {
        $transactionId = $webhookData['transaction_id'] ?? null;
        $amount = $webhookData['amount'] ?? 0;
        $reference = $webhookData['reference'] ?? '';
        $status = $webhookData['status'] ?? '';

        if (!$transactionId || !$amount || !$reference || $status !== 'success') {
            return [
                'success' => false,
                'error' => 'Invalid webhook data'
            ];
        }

        // Check if already processed
        $existingDeposit = AutoDeposit::where('webhook_transaction_id', $transactionId)->first();
        if ($existingDeposit) {
            return [
                'success' => true,
                'message' => 'Already processed'
            ];
        }

        // Find matching deposit
        $autoDeposit = AutoDeposit::where('reference_code', $reference)
            ->where('status', 'pending')
            ->first();

        if (!$autoDeposit) {
            return [
                'success' => false,
                'error' => 'No matching deposit found'
            ];
        }

        // Verify amount
        $amountTolerance = env('AMOUNT_TOLERANCE', 2000);
        $amountDiff = abs($amount - $autoDeposit->amount);
        if ($amountDiff > $amountTolerance) {
            return [
                'success' => false,
                'error' => 'Amount mismatch'
            ];
        }

        return $this->completeDeposit($autoDeposit, $transactionId, $webhookData);
    }

    private function completeDeposit(AutoDeposit $autoDeposit, string $transactionId, array $webhookData): array
    {
        DB::beginTransaction();

        try {
            // Update auto deposit
            $autoDeposit->update([
                'status' => 'completed',
                'webhook_transaction_id' => $transactionId,
                'webhook_data' => $webhookData,
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
                'description' => "Nạp tiền tự động - {$autoDeposit->reference_code}",
                'status' => 'completed',
                'reference_code' => $autoDeposit->reference_code,
                'processed_at' => now(),
            ]);

            DB::commit();

            Log::info('SePay deposit completed successfully', [
                'user_id' => $user->id,
                'amount' => $autoDeposit->amount,
                'reference' => $autoDeposit->reference_code,
                'transaction_id' => $transactionId,
            ]);

            return [
                'success' => true,
                'message' => 'Deposit processed successfully'
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error completing SePay deposit', [
                'error' => $e->getMessage(),
                'reference' => $autoDeposit->reference_code
            ]);

            return [
                'success' => false,
                'error' => 'Processing failed'
            ];
        }
    }

    private function callSepayAPI(string $referenceCode, float $amount): array
    {
        try {
            $payload = [
                'merchant_id' => $this->config['merchant_id'],
                'amount' => $amount,
                'reference' => $referenceCode,
                'description' => 'Nạp tiền Account Shop',
                'expires_in' => env('DEPOSIT_EXPIRATION_MINUTES', 15) * 60, // Convert to seconds
                'callback_url' => $this->config['webhook_url'],
                'return_url' => env('FRONTEND_URL', 'https://dinhquocviet.space') . '/auto-deposit',
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->config['api_key'],
                'Content-Type' => 'application/json',
                'X-SePay-Signature' => $this->generateSignature($payload),
            ])->post($this->config['base_url'] . '/qr/create', $payload);

            Log::info('SePay API request', [
                'url' => $this->config['base_url'] . '/qr/create',
                'payload' => $payload,
                'response_status' => $response->status(),
                'response_body' => $response->json(),
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            Log::error('SePay API error', [
                'response' => $response->json(),
                'status' => $response->status(),
            ]);

            return [
                'success' => false,
                'error' => 'SePay API error: ' . ($response->json()['message'] ?? 'Unknown error')
            ];

        } catch (\Exception $e) {
            Log::error('SePay API exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => 'Network error: ' . $e->getMessage()
            ];
        }
    }

    private function validateConfiguration(): void
    {
        if (!$this->config['api_key'] || !$this->config['secret_key'] || !$this->config['merchant_id']) {
            throw new \Exception('SePay configuration is incomplete');
        }
    }

    private function generateReferenceCode(int $userId): string
    {
        return 'NAP' . $userId . 'T' . time() . 'R' . rand(1000, 9999);
    }

    private function generateSignature(array $data): string
    {
        $payload = json_encode($data);
        return hash_hmac('sha256', $payload, $this->config['secret_key']);
    }

    public function verifyWebhookSignature(string $signature, string $payload): bool
    {
        if (!$signature || !$payload || !$this->config['secret_key']) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $this->config['secret_key']);
        return hash_equals($expectedSignature, $signature);
    }

    public function checkTransactionStatus(string $transactionId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->config['api_key'],
                'Content-Type' => 'application/json',
            ])->get($this->config['base_url'] . '/transaction/' . $transactionId);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => 'Failed to check transaction status'
            ];

        } catch (\Exception $e) {
            Log::error('Error checking SePay transaction status', [
                'error' => $e->getMessage(),
                'transaction_id' => $transactionId,
            ]);

            return [
                'success' => false,
                'error' => 'Network error'
            ];
        }
    }
}
