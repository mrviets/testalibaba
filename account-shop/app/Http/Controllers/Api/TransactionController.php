<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $transactions
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:deposit,purchase,refund',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        // Only allow deposit requests from users
        if ($request->type !== 'deposit') {
            return response()->json([
                'status' => 'error',
                'message' => 'Chỉ được phép tạo yêu cầu nạp tiền'
            ], 403);
        }

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'amount' => $request->amount,
            'description' => $request->description,
            'status' => 'pending',
            'reference_code' => 'TXN-' . time() . '-' . rand(1000, 9999),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Yêu cầu giao dịch đã được tạo',
            'data' => $transaction
        ], 201);
    }
}
