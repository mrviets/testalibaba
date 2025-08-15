<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DownloadController extends Controller
{
    public function downloadOrder($id, Request $request)
    {
        $order = Order::with(['account', 'product'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->find($id);

        if (!$order || !$order->account) {
            return response()->json([
                'status' => 'error',
                'message' => 'Đơn hàng không tồn tại hoặc chưa hoàn thành'
            ], 404);
        }

        $content = $this->formatAccountData($order->account);
        $filename = "order-{$id}-{$order->product->name}.txt";

        return response($content)
            ->header('Content-Type', 'text/plain')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    public function downloadMultiple(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_ids' => 'required|array',
            'order_ids.*' => 'integer|exists:orders,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $orders = Order::with(['account', 'product'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->whereIn('id', $request->order_ids)
            ->get();

        if ($orders->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy đơn hàng hợp lệ'
            ], 404);
        }

        $content = '';
        foreach ($orders as $order) {
            if ($order->account) {
                $content .= "=== {$order->product->name} - Order #{$order->id} ===\n";
                $content .= $this->formatAccountData($order->account);
                $content .= "\n\n";
            }
        }

        $filename = "selected-orders-" . date('Y-m-d-H-i-s') . ".txt";

        return response($content)
            ->header('Content-Type', 'text/plain')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    public function downloadAll(Request $request)
    {
        $orders = Order::with(['account', 'product'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->whereHas('account')
            ->get();

        if ($orders->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không có tài khoản nào để tải xuống'
            ], 404);
        }

        $content = '';
        foreach ($orders as $order) {
            $content .= "=== {$order->product->name} - Order #{$order->id} ===\n";
            $content .= $this->formatAccountData($order->account);
            $content .= "\n\n";
        }

        $filename = "all-accounts-" . date('Y-m-d-H-i-s') . ".txt";

        return response($content)
            ->header('Content-Type', 'text/plain')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    private function formatAccountData($account)
    {
        $content = '';

        // Ưu tiên account_data nếu có
        if ($account->account_data) {
            $content .= $account->account_data . "\n";
        } else {
            // Fallback về format cũ
            $content .= "Username: {$account->username}\n";
            $content .= "Password: {$account->password}\n";

            if ($account->additional_info) {
                $content .= "Additional Info: {$account->additional_info}\n";
            }
        }

        return $content;
    }
}
