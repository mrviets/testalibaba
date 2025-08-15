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
        Schema::table('products', function (Blueprint $table) {
            $table->string('image_url')->nullable()->after('description');
            $table->enum('product_type', ['account', 'tool'])->default('account')->after('image_url');
            $table->text('tutorial_content')->nullable()->after('product_type');
            $table->string('tutorial_video_url')->nullable()->after('tutorial_content');
            $table->json('tutorial_steps')->nullable()->after('tutorial_video_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['image_url', 'product_type', 'tutorial_content', 'tutorial_video_url', 'tutorial_steps']);
        });
    }
};
