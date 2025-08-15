<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutoDeposit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reference_code',
        'amount',
        'bank_account',
        'qr_code_url',
        'status',
        'webhook_transaction_id',
        'webhook_data',
        'expires_at',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'webhook_data' => 'array',
        'expires_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at < now();
    }

    public function canBeCompleted(): bool
    {
        return $this->status === 'pending' && !$this->isExpired();
    }

    public function generateReferenceCode(): string
    {
        return 'NAP' . $this->user_id . 'T' . time() . 'R' . rand(1000, 9999);
    }

    public static function generateVietQR(string $bankAccount, float $amount, string $reference): string
    {
        // VietQR API endpoint
        $baseUrl = 'https://img.vietqr.io/image';
        $bankCode = '970422'; // VietinBank - thay đổi theo ngân hàng của bạn

        $params = [
            'accountNo' => $bankAccount,
            'amount' => $amount,
            'addInfo' => $reference,
            'accountName' => 'ACCOUNT SHOP',
        ];

        $queryString = http_build_query($params);
        return "{$baseUrl}/{$bankCode}-{$bankAccount}-compact2.jpg?{$queryString}";
    }
}
