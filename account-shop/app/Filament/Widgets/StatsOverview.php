<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Tổng người dùng', User::count())
                ->description('Số lượng người dùng đã đăng ký')
                ->descriptionIcon('heroicon-m-users')
                ->color('success'),

            Stat::make('Tổng sản phẩm', Product::count())
                ->description('Số lượng sản phẩm trong hệ thống')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('info'),

            Stat::make('Đơn hàng hôm nay', Order::whereDate('created_at', today())->count())
                ->description('Số đơn hàng được tạo hôm nay')
                ->descriptionIcon('heroicon-m-shopping-cart')
                ->color('warning'),

            Stat::make('Doanh thu hôm nay', 'VNĐ ' . number_format(
                Order::whereDate('created_at', today())
                    ->where('status', 'completed')
                    ->sum('amount'), 0, ',', '.'
            ))
                ->description('Tổng doanh thu hôm nay')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),

            Stat::make('Giao dịch chờ duyệt', Transaction::where('status', 'pending')->count())
                ->description('Số giao dịch nạp tiền chờ xác nhận')
                ->descriptionIcon('heroicon-m-clock')
                ->color('danger'),
        ];
    }
}
