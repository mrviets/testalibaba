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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('username');
            $table->string('password');
            $table->text('additional_info')->nullable(); // Thông tin bổ sung như email recovery, etc.
            $table->enum('status', ['available', 'sold', 'reserved'])->default('available');
            $table->foreignId('sold_to_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('sold_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
