<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransactionResource\Pages;
use App\Filament\Resources\TransactionResource\RelationManagers;
use App\Models\Transaction;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class TransactionResource extends Resource
{
    protected static ?string $model = Transaction::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationLabel = 'Giao dịch';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->label('Người dùng')
                    ->options(\App\Models\User::pluck('name', 'id'))
                    ->required()
                    ->searchable(),
                Forms\Components\Select::make('type')
                    ->label('Loại giao dịch')
                    ->options([
                        'deposit' => 'Nạp tiền',
                        'purchase' => 'Mua hàng',
                        'refund' => 'Hoàn tiền',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('amount')
                    ->label('Số tiền')
                    ->numeric()
                    ->required()
                    ->suffix('VNĐ'),
                Forms\Components\Textarea::make('description')
                    ->label('Mô tả')
                    ->required()
                    ->rows(3),
                Forms\Components\TextInput::make('reference_code')
                    ->label('Mã tham chiếu')
                    ->maxLength(255),
                Forms\Components\Select::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Chờ xử lý',
                        'completed' => 'Hoàn thành',
                        'failed' => 'Thất bại',
                        'cancelled' => 'Đã hủy',
                    ])
                    ->required()
                    ->default('pending'),
                Forms\Components\DateTimePicker::make('processed_at')
                    ->label('Ngày xử lý')
                    ->nullable(),
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Thông tin giao dịch')
                    ->schema([
                        Infolists\Components\TextEntry::make('user.name')
                            ->label('Người dùng'),
                        Infolists\Components\TextEntry::make('type')
                            ->label('Loại giao dịch')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'deposit' => 'success',
                                'purchase' => 'warning',
                                'refund' => 'info',
                                default => 'gray',
                            }),
                        Infolists\Components\TextEntry::make('amount')
                            ->label('Số tiền')
                            ->money('VND'),
                        Infolists\Components\TextEntry::make('description')
                            ->label('Mô tả'),
                        Infolists\Components\TextEntry::make('reference_code')
                            ->label('Mã tham chiếu'),
                    ])->columns(2),
                Infolists\Components\Section::make('Trạng thái & Xử lý')
                    ->schema([
                        Infolists\Components\TextEntry::make('status')
                            ->label('Trạng thái')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'completed' => 'success',
                                'pending' => 'warning',
                                'failed' => 'danger',
                                'cancelled' => 'gray',
                                default => 'gray',
                            }),
                        Infolists\Components\TextEntry::make('processedBy.name')
                            ->label('Xử lý bởi'),
                        Infolists\Components\TextEntry::make('processed_at')
                            ->label('Ngày xử lý')
                            ->dateTime(),
                        Infolists\Components\TextEntry::make('created_at')
                            ->label('Ngày tạo')
                            ->dateTime(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Người dùng')
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Loại')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'deposit' => 'success',
                        'purchase' => 'warning',
                        'refund' => 'info',
                    }),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Số tiền')
                    ->money('VND')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trạng thái')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'completed' => 'success',
                        'failed' => 'danger',
                        'cancelled' => 'gray',
                    }),
                Tables\Columns\TextColumn::make('reference_code')
                    ->label('Mã tham chiếu')
                    ->searchable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Loại giao dịch')
                    ->options([
                        'deposit' => 'Nạp tiền',
                        'purchase' => 'Mua hàng',
                        'refund' => 'Hoàn tiền',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Chờ xử lý',
                        'completed' => 'Hoàn thành',
                        'failed' => 'Thất bại',
                        'cancelled' => 'Đã hủy',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Duyệt')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->visible(fn (Transaction $record): bool => $record->status === 'pending' && $record->type === 'deposit')
                    ->action(function (Transaction $record): void {
                        $record->update([
                            'status' => 'completed',
                            'processed_at' => now(),
                            'processed_by' => auth()->id(),
                        ]);

                        $record->user->increment('balance', $record->amount);

                        Notification::make()
                            ->title('Đã duyệt giao dịch nạp tiền')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Từ chối')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->visible(fn (Transaction $record): bool => $record->status === 'pending')
                    ->requiresConfirmation()
                    ->action(function (Transaction $record): void {
                        $record->update([
                            'status' => 'failed',
                            'processed_at' => now(),
                            'processed_by' => auth()->id(),
                        ]);

                        Notification::make()
                            ->title('Đã từ chối giao dịch')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListTransactions::route('/'),
            'create' => Pages\CreateTransaction::route('/create'),
            'view' => Pages\ViewTransaction::route('/{record}'),
            'edit' => Pages\EditTransaction::route('/{record}/edit'),
        ];
    }
}
