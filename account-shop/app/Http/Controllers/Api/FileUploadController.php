<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FileUploadController extends Controller
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

    public function uploadAccountsFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'file' => 'required|file|mimes:txt|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'File không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::find($request->product_id);
        $file = $request->file('file');

        Log::info('File upload started', [
            'admin_id' => $request->user()->id,
            'product_id' => $product->id,
            'filename' => $file->getClientOriginalName(),
            'filesize' => $file->getSize()
        ]);

        try {
            // Read file content
            $content = file_get_contents($file->getRealPath());
            
            if (!$content) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File rỗng hoặc không đọc được'
                ], 400);
            }

            // Parse accounts
            $accounts = $this->parseAccountData($content);
            
            if (empty($accounts)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy tài khoản hợp lệ trong file'
                ], 400);
            }

            if (count($accounts) > 10000) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tối đa 10,000 tài khoản mỗi lần upload'
                ], 400);
            }

            // Bulk insert accounts
            $result = $this->bulkInsertAccounts($product->id, $accounts, $request->user()->id);

            return response()->json([
                'status' => 'success',
                'message' => $result['message'],
                'data' => $result['stats']
            ], 201);

        } catch (\Exception $e) {
            Log::error('File upload failed', [
                'admin_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi xử lý file'
            ], 500);
        }
    }

    private function parseAccountData(string $content): array
    {
        $lines = explode("\n", $content);
        $accounts = [];

        foreach ($lines as $lineNumber => $line) {
            $line = trim($line);
            if (empty($line)) continue;

            $username = '';
            $password = '';
            $accountData = $line;

            // Support multiple formats
            if (strpos($line, '|') !== false) {
                // Format: username|password|additional_data
                $parts = explode('|', $line);
                $username = trim($parts[0] ?? '');
                $password = trim($parts[1] ?? '');
            } elseif (strpos($line, ':') !== false) {
                // Format: username:password
                $parts = explode(':', $line, 2);
                $username = trim($parts[0] ?? '');
                $password = trim($parts[1] ?? '');
            } elseif (strpos($line, ' ') !== false) {
                // Format: username password
                $parts = explode(' ', $line, 2);
                $username = trim($parts[0] ?? '');
                $password = trim($parts[1] ?? '');
            } elseif (strpos($line, '@') !== false) {
                // Format: email only
                $username = trim($line);
                $password = 'default123';
            }

            if (!empty($username)) {
                $accounts[] = [
                    'username' => $username,
                    'password' => $password ?: 'default123',
                    'account_data' => $accountData,
                    'line_number' => $lineNumber + 1
                ];
            }
        }

        return $accounts;
    }

    private function bulkInsertAccounts(int $productId, array $accounts, int $adminId): array
    {
        $successCount = 0;
        $duplicateCount = 0;
        $errorCount = 0;
        $errors = [];

        DB::beginTransaction();

        try {
            foreach ($accounts as $accountData) {
                try {
                    // Check for duplicate
                    $existing = Account::where('product_id', $productId)
                        ->where('username', $accountData['username'])
                        ->first();

                    if ($existing) {
                        $duplicateCount++;
                        continue;
                    }

                    Account::create([
                        'product_id' => $productId,
                        'username' => $accountData['username'],
                        'password' => $accountData['password'],
                        'account_data' => $accountData['account_data'],
                        'status' => 'available',
                    ]);

                    $successCount++;

                } catch (\Exception $e) {
                    $errorCount++;
                    $errors[] = "Dòng {$accountData['line_number']}: {$e->getMessage()}";
                    
                    if ($errorCount > 100) { // Limit error logging
                        break;
                    }
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
                'admin_id' => $adminId,
                'product_id' => $productId,
                'success_count' => $successCount,
                'duplicate_count' => $duplicateCount,
                'error_count' => $errorCount
            ]);

            return [
                'message' => $message,
                'stats' => [
                    'success_count' => $successCount,
                    'duplicate_count' => $duplicateCount,
                    'error_count' => $errorCount,
                    'total_processed' => count($accounts),
                    'errors' => array_slice($errors, 0, 10) // First 10 errors
                ]
            ];

        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }
}
