<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'is_active',
        'available_count',
        'image_url',
        'product_type',
        'tutorial_content',
        'tutorial_video_url',
        'tutorial_steps',
        'download_file_name',
        'download_file_size',
        'download_file_url',
        'download_requirements',
        'download_instructions',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'tutorial_steps' => 'array',
    ];

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function availableAccounts()
    {
        return $this->hasMany(Account::class)->where('status', 'available');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
