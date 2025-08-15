<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['product', 'account'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::find($request->product_id);
        $user = $request->user();
        $quantity = $request->quantity;
        $totalAmount = $product->price * $quantity;

        // Check balance
        if ($user->balance < $totalAmount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Số dư không đủ để thực hiện giao dịch'
            ], 400);
        }

        // Check available accounts
        $availableAccounts = Account::where('product_id', $product->id)
            ->where('status', 'available')
            ->count();

        if ($availableAccounts < $quantity) {
            return response()->json([
                'status' => 'error',
                'message' => "Chỉ còn {$availableAccounts} tài khoản có sẵn"
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Get accounts to assign
            $accounts = Account::where('product_id', $product->id)
                ->where('status', 'available')
                ->limit($quantity)
                ->get();

            // Create orders for each account
            $orders = [];
            foreach ($accounts as $account) {
                $order = Order::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'account_id' => $account->id,
                    'order_code' => 'ORD-' . time() . '-' . rand(1000, 9999),
                    'amount' => $product->price,
                    'quantity' => 1,
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);

                // Update account status
                $account->update([
                    'status' => 'sold',
                    'sold_to_user_id' => $user->id,
                    'sold_at' => now(),
                ]);

                $orders[] = $order;
            }

            // Deduct balance
            $user->decrement('balance', $totalAmount);

            // Create transaction record
            Transaction::create([
                'user_id' => $user->id,
                'type' => 'purchase',
                'amount' => $totalAmount,
                'description' => "Mua {$quantity} tài khoản {$product->name}",
                'status' => 'completed',
                'processed_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Mua hàng thành công',
                'data' => $orders
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();

            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi xử lý đơn hàng'
            ], 500);
        }
    }

    public function show($id, Request $request)
    {
        $order = Order::with(['product', 'account'])
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Đơn hàng không tồn tại'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }
}
