<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-cart';

    protected static ?string $navigationLabel = 'Đơn hàng';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->label('Khách hàng')
                    ->options(\App\Models\User::pluck('name', 'id'))
                    ->required()
                    ->searchable(),
                Forms\Components\Select::make('product_id')
                    ->label('Sản phẩm')
                    ->options(\App\Models\Product::pluck('name', 'id'))
                    ->required()
                    ->searchable(),
                Forms\Components\Select::make('account_id')
                    ->label('Tài khoản')
                    ->options(\App\Models\Account::with('product')->get()->pluck('username', 'id'))
                    ->searchable()
                    ->nullable(),
                Forms\Components\TextInput::make('order_code')
                    ->label('Mã đơn hàng')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('amount')
                    ->label('Số tiền')
                    ->numeric()
                    ->required()
                    ->suffix('VNĐ'),
                Forms\Components\TextInput::make('quantity')
                    ->label('Số lượng')
                    ->numeric()
                    ->required()
                    ->default(1)
                    ->minValue(1),
                Forms\Components\Select::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Chờ xử lý',
                        'completed' => 'Hoàn thành',
                        'failed' => 'Thất bại',
                        'refunded' => 'Đã hoàn tiền',
                    ])
                    ->required()
                    ->default('pending'),
                Forms\Components\DateTimePicker::make('completed_at')
                    ->label('Ngày hoàn thành')
                    ->nullable(),
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Thông tin đơn hàng')
                    ->schema([
                        Infolists\Components\TextEntry::make('order_code')
                            ->label('Mã đơn hàng')
                            ->copyable(),
                        Infolists\Components\TextEntry::make('user.name')
                            ->label('Khách hàng'),
                        Infolists\Components\TextEntry::make('product.name')
                            ->label('Sản phẩm'),
                        Infolists\Components\TextEntry::make('quantity')
                            ->label('Số lượng')
                            ->badge()
                            ->color('info'),
                        Infolists\Components\TextEntry::make('amount')
                            ->label('Số tiền')
                            ->money('VND'),
                        Infolists\Components\TextEntry::make('status')
                            ->label('Trạng thái')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'completed' => 'success',
                                'pending' => 'warning',
                                'failed' => 'danger',
                                'refunded' => 'info',
                                default => 'gray',
                            }),
                    ])->columns(2),
                Infolists\Components\Section::make('Tài khoản')
                    ->schema([
                        Infolists\Components\TextEntry::make('account.username')
                            ->label('Username')
                            ->copyable(),
                        Infolists\Components\TextEntry::make('account.password')
                            ->label('Password')
                            ->copyable(),
                        Infolists\Components\TextEntry::make('account.account_data')
                            ->label('Dữ liệu gốc')
                            ->copyable(),
                    ])->columns(1)
                    ->visible(fn ($record) => $record->account && $record->status === 'completed'),
                Infolists\Components\Section::make('Thời gian')
                    ->schema([
                        Infolists\Components\TextEntry::make('created_at')
                            ->label('Ngày tạo')
                            ->dateTime(),
                        Infolists\Components\TextEntry::make('completed_at')
                            ->label('Ngày hoàn thành')
                            ->dateTime(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_code')
                    ->label('Mã đơn hàng')
                    ->searchable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Khách hàng')
                    ->searchable(),
                Tables\Columns\TextColumn::make('product.name')
                    ->label('Sản phẩm')
                    ->searchable(),
                Tables\Columns\TextColumn::make('quantity')
                    ->label('Số lượng')
                    ->sortable()
                    ->badge()
                    ->color('info'),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Giá')
                    ->money('VND')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trạng thái')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'completed' => 'success',
                        'failed' => 'danger',
                        'refunded' => 'info',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Chờ xử lý',
                        'completed' => 'Hoàn thành',
                        'failed' => 'Thất bại',
                        'refunded' => 'Đã hoàn tiền',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
            'view' => Pages\ViewOrder::route('/{record}'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
