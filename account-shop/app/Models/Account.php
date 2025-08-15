<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'username',
        'password',
        'additional_info',
        'account_data', // Lưu toàn bộ dòng tài khoản
        'status',
        'sold_to_user_id',
        'sold_at',
    ];

    protected $casts = [
        'sold_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function soldToUser()
    {
        return $this->belongsTo(User::class, 'sold_to_user_id');
    }

    public function order()
    {
        return $this->hasOne(Order::class);
    }
}
