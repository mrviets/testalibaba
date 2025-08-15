<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutoDeposit;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AutoDepositController extends Controller
{
    private function getBankAccount(): string
    {
        return env('BANK_ACCOUNT_NUMBER', '1234567890');
    }

    private function getSepaySecret(): string
    {
        return env('SEPAY_SECRET_KEY', 'your-sepay-secret-key');
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

        // Kiểm tra rate limit - không cho nạp quá 5 lần trong 1 giờ
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
            $autoDeposit = new AutoDeposit();
            $autoDeposit->user_id = $user->id;
            $autoDeposit->amount = $amount;
            $autoDeposit->bank_account = $this->getBankAccount();
            $autoDeposit->reference_code = $autoDeposit->generateReferenceCode();
            $autoDeposit->expires_at = now()->addMinutes(15); // Hết hạn sau 15 phút
            $autoDeposit->save();

            // Tạo QR code
            $qrUrl = AutoDeposit::generateVietQR(
                $this->getBankAccount(),
                $amount,
                $autoDeposit->reference_code
            );
            $autoDeposit->qr_code_url = $qrUrl;
            $autoDeposit->save();

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
                        'Quét mã QR hoặc chuyển khoản thủ công',
                        'STK: ' . $autoDeposit->bank_account,
                        'Số tiền: ' . number_format($amount) . ' VNĐ',
                        'Nội dung: ' . $autoDeposit->reference_code,
                        'Lệnh hết hạn sau 15 phút'
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating auto deposit', ['error' => $e->getMessage(), 'user_id' => $user->id]);

            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi tạo lệnh nạp tiền'
            ], 500);
        }
    }

    public function getMyDeposits(Request $request)
    {
        $deposits = AutoDeposit::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $deposits
        ]);
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

        return response()->json([
            'status' => 'success',
            'data' => $deposit
        ]);
    }
}
