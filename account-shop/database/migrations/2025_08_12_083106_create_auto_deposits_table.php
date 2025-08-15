<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('auto_deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('reference_code')->unique(); // Mã tham chiếu duy nhất
            $table->decimal('amount', 15, 2); // Số tiền nạp
            $table->string('bank_account'); // STK nhận tiền
            $table->string('qr_code_url')->nullable(); // URL QR code
            $table->enum('status', ['pending', 'completed', 'expired', 'failed'])->default('pending');
            $table->string('webhook_transaction_id')->nullable()->unique(); // ID từ webhook
            $table->json('webhook_data')->nullable(); // Raw data từ webhook
            $table->timestamp('expires_at'); // Thời gian hết hạn
            $table->timestamp('completed_at')->nullable(); // Thời gian hoàn thành
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['reference_code']);
            $table->index(['webhook_transaction_id']);
            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auto_deposits');
    }
};
