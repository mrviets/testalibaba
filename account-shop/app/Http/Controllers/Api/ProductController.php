<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::withCount(['accounts as available_count' => function ($query) {
            $query->where('status', 'available');
        }])
        ->withCount(['accounts as total_count'])
        ->orderBy('name')
        ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function show($id)
    {
        $product = Product::withCount(['accounts as available_count' => function ($query) {
            $query->where('status', 'available');
        }])
        ->withCount(['accounts as total_count'])
        ->find($id);

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sản phẩm không tồn tại'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $product
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'product_type' => 'required|in:account,tool',
            'image_url' => 'nullable|url',
            'tutorial_content' => 'nullable|string',
            'tutorial_video_url' => 'nullable|url',
            'tutorial_steps' => 'nullable|array',
            'tutorial_steps.*' => 'string'
        ]);

        $product = Product::create($request->all());

        return response()->json([
            'status' => 'success',
            'data' => $product,
            'message' => 'Tạo sản phẩm thành công'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'product_type' => 'sometimes|required|in:account,tool',
            'image_url' => 'nullable|url',
            'tutorial_content' => 'nullable|string',
            'tutorial_video_url' => 'nullable|url',
            'tutorial_steps' => 'nullable|array',
            'tutorial_steps.*' => 'string'
        ]);

        $product->update($request->all());

        return response()->json([
            'status' => 'success',
            'data' => $product,
            'message' => 'Cập nhật sản phẩm thành công'
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Check if product has orders
        if ($product->orders()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể xóa sản phẩm đã có đơn hàng'
            ], 400);
        }

        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Xóa sản phẩm thành công'
        ]);
    }
}
