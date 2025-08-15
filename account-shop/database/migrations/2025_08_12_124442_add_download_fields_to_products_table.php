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
            $table->string('download_file_name')->nullable()->after('tutorial_steps');
            $table->string('download_file_size')->nullable()->after('download_file_name');
            $table->string('download_file_url')->nullable()->after('download_file_size');
            $table->text('download_requirements')->nullable()->after('download_file_url');
            $table->text('download_instructions')->nullable()->after('download_requirements');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'download_file_name',
                'download_file_size',
                'download_file_url',
                'download_requirements',
                'download_instructions'
            ]);
        });
    }
};
