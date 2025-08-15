<?php

namespace App\Console\Commands;

use App\Services\SepayService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TestSepayConnection extends Command
{
    protected $signature = 'sepay:test {--amount=10000}';
    protected $description = 'Test SePay API connection and create a test deposit';

    public function handle()
    {
        $this->info('🔍 Testing SePay API connection...');

        // Check environment variables
        $this->checkEnvironmentVariables();

        // Test API connection
        $this->testApiConnection();

        // Test webhook signature
        $this->testWebhookSignature();

        $this->info('✅ SePay connection test completed!');
    }

    private function checkEnvironmentVariables()
    {
        $this->info('📋 Checking environment variables...');

        $requiredVars = [
            'SEPAY_API_KEY',
            'SEPAY_SECRET_KEY', 
            'SEPAY_MERCHANT_ID',
            'SEPAY_BASE_URL',
            'SEPAY_WEBHOOK_URL',
            'BANK_ACCOUNT_NUMBER',
        ];

        $missing = [];
        foreach ($requiredVars as $var) {
            if (!env($var)) {
                $missing[] = $var;
            }
        }

        if (!empty($missing)) {
            $this->error('❌ Missing environment variables:');
            foreach ($missing as $var) {
                $this->error("   - {$var}");
            }
            return false;
        }

        $this->info('✅ All environment variables are set');
        return true;
    }

    private function testApiConnection()
    {
        $this->info('🌐 Testing API connection...');

        try {
            $sepayService = new SepayService();
            
            // Test with a dummy user (you might need to create one)
            $testUser = \App\Models\User::first();
            if (!$testUser) {
                $this->warn('⚠️  No users found in database. Creating test user...');
                $testUser = \App\Models\User::create([
                    'name' => 'Test User',
                    'email' => 'test@example.com',
                    'password' => bcrypt('password'),
                ]);
            }

            $amount = $this->option('amount');
            $result = $sepayService->createDeposit($testUser, $amount);

            if ($result['success']) {
                $this->info('✅ SePay API connection successful!');
                $this->info("📊 Test deposit created:");
                $this->info("   - ID: {$result['data']['id']}");
                $this->info("   - Reference: {$result['data']['reference_code']}");
                $this->info("   - Amount: " . number_format($result['data']['amount']) . " VNĐ");
                $this->info("   - QR URL: {$result['data']['qr_code_url']}");
            } else {
                $this->error('❌ SePay API connection failed:');
                $this->error("   - Error: {$result['error']}");
            }

        } catch (\Exception $e) {
            $this->error('❌ Exception during API test:');
            $this->error("   - Message: {$e->getMessage()}");
            Log::error('SePay API test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    private function testWebhookSignature()
    {
        $this->info('🔐 Testing webhook signature verification...');

        try {
            $sepayService = new SepayService();
            
            $testPayload = json_encode([
                'transaction_id' => 'test_123',
                'amount' => 10000,
                'reference' => 'TEST123',
                'status' => 'success',
            ]);

            $secretKey = env('SEPAY_SECRET_KEY');
            $expectedSignature = hash_hmac('sha256', $testPayload, $secretKey);

            $isValid = $sepayService->verifyWebhookSignature($expectedSignature, $testPayload);

            if ($isValid) {
                $this->info('✅ Webhook signature verification working correctly');
            } else {
                $this->error('❌ Webhook signature verification failed');
            }

        } catch (\Exception $e) {
            $this->error('❌ Exception during signature test:');
            $this->error("   - Message: {$e->getMessage()}");
        }
    }
}
