<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if ($request->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không có quyền truy cập'
                ], 403);
            }
            return $next($request);
        });
    }

    public function bulkUploadAccounts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'accounts' => 'required|array|min:1|max:10000',
            'accounts.*.username' => 'required|string|max:255',
            'accounts.*.password' => 'required|string|max:255',
            'accounts.*.account_data' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::find($request->product_id);
        $accounts = $request->accounts;

        Log::info('Bulk upload started', [
            'admin_id' => $request->user()->id,
            'product_id' => $product->id,
            'account_count' => count($accounts)
        ]);

        DB::beginTransaction();

        try {
            $successCount = 0;
            $duplicateCount = 0;
            $errorCount = 0;

            foreach ($accounts as $accountData) {
                try {
                    // Check for duplicate username in this product
                    $existing = Account::where('product_id', $product->id)
                        ->where('username', $accountData['username'])
                        ->first();

                    if ($existing) {
                        $duplicateCount++;
                        continue;
                    }

                    Account::create([
                        'product_id' => $product->id,
                        'username' => $accountData['username'],
                        'password' => $accountData['password'],
                        'account_data' => $accountData['account_data'],
                        'status' => 'available',
                        'additional_info' => $accountData['additional_info'] ?? null,
                    ]);

                    $successCount++;

                } catch (\Exception $e) {
                    $errorCount++;
                    Log::error('Error creating account', [
                        'username' => $accountData['username'],
                        'error' => $e->getMessage()
                    ]);
                }
            }

            DB::commit();

            $message = "Upload hoàn thành! Thành công: {$successCount}";
            if ($duplicateCount > 0) {
                $message .= ", Trùng lặp: {$duplicateCount}";
            }
            if ($errorCount > 0) {
                $message .= ", Lỗi: {$errorCount}";
            }

            Log::info('Bulk upload completed', [
                'admin_id' => $request->user()->id,
                'product_id' => $product->id,
                'success_count' => $successCount,
                'duplicate_count' => $duplicateCount,
                'error_count' => $errorCount
            ]);

            return response()->json([
                'status' => 'success',
                'message' => $message,
                'data' => [
                    'success_count' => $successCount,
                    'duplicate_count' => $duplicateCount,
                    'error_count' => $errorCount,
                    'total_processed' => count($accounts)
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Bulk upload failed', [
                'admin_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi upload tài khoản'
            ], 500);
        }
    }

    public function getStats(Request $request)
    {
        $stats = [
            'total_users' => User::count(),
            'total_products' => Product::count(),
            'total_accounts' => Account::count(),
            'available_accounts' => Account::where('status', 'available')->count(),
            'sold_accounts' => Account::where('status', 'sold')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }

    public function updateUserBalance(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'balance' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::find($request->user_id);
        $oldBalance = $user->balance;
        $user->update(['balance' => $request->balance]);

        Log::info('Admin updated user balance', [
            'admin_id' => $request->user()->id,
            'user_id' => $user->id,
            'old_balance' => $oldBalance,
            'new_balance' => $request->balance
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật số dư thành công',
            'data' => $user
        ]);
    }
}
