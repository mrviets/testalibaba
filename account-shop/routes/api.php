<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\DownloadController;
use App\Http\Controllers\Api\AutoDepositController;
use App\Http\Controllers\Api\BankWebhookController;
use App\Http\Controllers\Api\SepayController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\FileUploadController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/



// Public routes (no prefix needed, already under /api)
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

// Webhook routes (no auth required)
Route::post('bank/sepay-webhook', [BankWebhookController::class, 'sepayWebhook']);
Route::post('bank/casso-webhook', [BankWebhookController::class, 'cassoWebhook']);

// SePay Integration Routes
Route::post('sepay/webhook', [SepayController::class, 'webhook']);
Route::post('sepay/deposit', [SepayController::class, 'createDeposit']);
Route::post('sepay/deposit-personal', [SepayController::class, 'createDepositPersonal']);
Route::get('sepay/deposit/{id}/status', [SepayController::class, 'checkStatus']);
Route::get('sepay/transactions', [SepayController::class, 'getTransactionHistory']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    // Products
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{id}', [ProductController::class, 'show']);

    // Admin Products
    Route::middleware('admin')->group(function () {
        Route::put('products/{id}', [ProductController::class, 'update']);
        Route::post('products', [ProductController::class, 'store']);
        Route::delete('products/{id}', [ProductController::class, 'destroy']);
    });

    // Orders
    Route::get('orders', [OrderController::class, 'index']);
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders/{id}', [OrderController::class, 'show']);

    // Transactions
    Route::get('transactions', [TransactionController::class, 'index']);
    Route::post('transactions', [TransactionController::class, 'store']);

    // Auto Deposits
    Route::post('auto-deposits', [AutoDepositController::class, 'createDeposit']);
    Route::get('auto-deposits', [AutoDepositController::class, 'getMyDeposits']);
    Route::get('auto-deposits/{id}/status', [AutoDepositController::class, 'checkStatus']);

    // Downloads
    Route::get('download/order/{id}', [DownloadController::class, 'downloadOrder']);
    Route::post('download/multiple', [DownloadController::class, 'downloadMultiple']);
    Route::get('download/all', [DownloadController::class, 'downloadAll']);

    // Admin routes
    Route::post('admin/accounts/bulk-upload', [AdminController::class, 'bulkUploadAccounts']);
    Route::post('admin/accounts/file-upload', [FileUploadController::class, 'uploadAccountsFile']);
    Route::get('admin/stats', [AdminController::class, 'getStats']);
    Route::post('admin/users/update-balance', [AdminController::class, 'updateUserBalance']);
});
