<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AccountResource\Pages;
use App\Filament\Resources\AccountResource\RelationManagers;
use App\Models\Account;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class AccountResource extends Resource
{
    protected static ?string $model = Account::class;

    protected static ?string $navigationIcon = 'heroicon-o-key';

    protected static ?string $navigationLabel = 'Tài khoản số';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('product_id')
                    ->label('Sản phẩm')
                    ->options(Product::pluck('name', 'id'))
                    ->required()
                    ->searchable(),
                Forms\Components\TextInput::make('username')
                    ->label('Username')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('password')
                    ->label('Password')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Textarea::make('additional_info')
                    ->label('Thông tin bổ sung')
                    ->rows(3),
                Forms\Components\Textarea::make('account_data')
                    ->label('Dữ liệu tài khoản gốc')
                    ->rows(2)
                    ->placeholder('username|password|2FA|cookie|...'),
                Forms\Components\Select::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'available' => 'Có sẵn',
                        'sold' => 'Đã bán',
                        'reserved' => 'Đã đặt',
                    ])
                    ->required()
                    ->default('available'),
                Forms\Components\Select::make('sold_to_user_id')
                    ->label('Đã bán cho')
                    ->options(\App\Models\User::pluck('name', 'id'))
                    ->searchable()
                    ->nullable(),
                Forms\Components\DateTimePicker::make('sold_at')
                    ->label('Ngày bán')
                    ->nullable(),
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Thông tin tài khoản')
                    ->schema([
                        Infolists\Components\TextEntry::make('product.name')
                            ->label('Sản phẩm'),
                        Infolists\Components\TextEntry::make('username')
                            ->label('Username')
                            ->copyable(),
                        Infolists\Components\TextEntry::make('password')
                            ->label('Password')
                            ->copyable(),
                        Infolists\Components\TextEntry::make('additional_info')
                            ->label('Thông tin bổ sung'),
                        Infolists\Components\TextEntry::make('account_data')
                            ->label('Dữ liệu gốc')
                            ->copyable(),
                    ])->columns(2),
                Infolists\Components\Section::make('Trạng thái')
                    ->schema([
                        Infolists\Components\TextEntry::make('status')
                            ->label('Trạng thái')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'available' => 'success',
                                'sold' => 'warning',
                                'reserved' => 'info',
                                default => 'gray',
                            }),
                        Infolists\Components\TextEntry::make('soldToUser.name')
                            ->label('Đã bán cho'),
                        Infolists\Components\TextEntry::make('sold_at')
                            ->label('Ngày bán')
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
                Tables\Columns\TextColumn::make('product.name')
                    ->label('Sản phẩm')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('username')
                    ->label('Username')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('password')
                    ->label('Password')
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->copyable(),
                Tables\Columns\TextColumn::make('account_data')
                    ->label('Dữ liệu gốc')
                    ->limit(50)
                    ->tooltip(function ($record) {
                        return $record->account_data ?: 'Không có dữ liệu gốc';
                    })
                    ->placeholder('Không có')
                    ->toggleable(isToggledHiddenByDefault: false),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trạng thái')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'available' => 'success',
                        'sold' => 'warning',
                        'reserved' => 'info',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('soldToUser.name')
                    ->label('Đã bán cho')
                    ->searchable()
                    ->placeholder('Chưa bán'),
                Tables\Columns\TextColumn::make('sold_at')
                    ->label('Ngày bán')
                    ->dateTime()
                    ->placeholder('Chưa bán'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('product_id')
                    ->label('Sản phẩm')
                    ->options(Product::pluck('name', 'id')),
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'available' => 'Có sẵn',
                        'sold' => 'Đã bán',
                        'reserved' => 'Đã đặt',
                    ]),
            ])
            ->actions([
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
            'index' => Pages\ListAccounts::route('/'),
            'create' => Pages\CreateAccount::route('/create'),
            'view' => Pages\ViewAccount::route('/{record}'),
            'edit' => Pages\EditAccount::route('/{record}/edit'),
        ];
    }
}
