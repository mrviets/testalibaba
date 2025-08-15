<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutoDeposit;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BankWebhookController extends Controller
{
    private function getSepaySecret(): string
    {
        return env('SEPAY_SECRET_KEY', 'your-sepay-secret-key');
    }

    public function sepayWebhook(Request $request)
    {
        // Log webhook data
        Log::info('SePay webhook received', ['data' => $request->all()]);

        // Verify signature (implement based on SePay docs)
        if (!$this->verifySepaySignature($request)) {
            Log::error('Invalid SePay webhook signature');
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 401);
        }

        $data = $request->all();

        // Extract transaction info from SePay webhook
        $transactionId = $data['transactionId'] ?? null;
        $amount = $data['amount'] ?? 0;
        $content = $data['content'] ?? '';
        $accountNumber = $data['accountNumber'] ?? '';

        if (!$transactionId || !$amount || !$content) {
            Log::error('Missing required webhook data', ['data' => $data]);
            return response()->json(['status' => 'error', 'message' => 'Missing data'], 400);
        }

        // Idempotency check
        $existingDeposit = AutoDeposit::where('webhook_transaction_id', $transactionId)->first();
        if ($existingDeposit) {
            Log::info('Webhook already processed', ['transaction_id' => $transactionId]);
            return response()->json(['status' => 'success', 'message' => 'Already processed'], 200);
        }

        // Find matching deposit by reference code
        $referenceCode = $this->extractReferenceCode($content);
        if (!$referenceCode) {
            Log::error('No reference code found in content', ['content' => $content]);
            return response()->json(['status' => 'error', 'message' => 'No reference code'], 400);
        }

        $autoDeposit = AutoDeposit::where('reference_code', $referenceCode)
            ->where('status', 'pending')
            ->first();

        if (!$autoDeposit) {
            Log::error('No matching deposit found', ['reference_code' => $referenceCode]);
            return response()->json(['status' => 'error', 'message' => 'No matching deposit'], 404);
        }

        // Verify amount matches (allow 1-2k difference for bank fees)
        $amountDiff = abs($amount - $autoDeposit->amount);
        if ($amountDiff > 2000) {
            Log::error('Amount mismatch', [
                'expected' => $autoDeposit->amount,
                'received' => $amount,
                'difference' => $amountDiff
            ]);
            return response()->json(['status' => 'error', 'message' => 'Amount mismatch'], 400);
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
                'description' => "Nạp tiền tự động - {$referenceCode}",
                'status' => 'completed',
                'reference_code' => $referenceCode,
                'processed_at' => now(),
            ]);

            DB::commit();

            Log::info('Auto deposit completed successfully', [
                'user_id' => $user->id,
                'amount' => $autoDeposit->amount,
                'reference_code' => $referenceCode
            ]);

            return response()->json(['status' => 'success', 'message' => 'Deposit processed'], 200);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error processing auto deposit', [
                'error' => $e->getMessage(),
                'reference_code' => $referenceCode
            ]);

            return response()->json(['status' => 'error', 'message' => 'Processing failed'], 500);
        }
    }

    private function verifySepaySignature(Request $request): bool
    {
        // Implement SePay signature verification
        // Check docs.sepay.vn for exact implementation
        $signature = $request->header('X-SePay-Signature');
        $payload = $request->getContent();

        if (!$signature || !$payload) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $this->getSepaySecret());

        return hash_equals($expectedSignature, $signature);
    }

    private function extractReferenceCode(string $content): ?string
    {
        // Extract reference code from transfer content
        // Pattern: NAP{user_id}T{timestamp}R{random}
        if (preg_match('/NAP\d+T\d+R\d+/', $content, $matches)) {
            return $matches[0];
        }

        return null;
    }

    public function cassoWebhook(Request $request)
    {
        // Similar implementation for Casso
        // Check casso.vn docs for webhook format
        Log::info('Casso webhook received', ['data' => $request->all()]);

        return response()->json(['status' => 'success'], 200);
    }
}
