<?php

namespace App\Filament\Pages;

use App\Models\Account;
use App\Models\Product;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Storage;

class ManageAccounts extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-document-arrow-up';

    protected static ?string $navigationLabel = 'Upload tài khoản';

    protected static string $view = 'filament.pages.manage-accounts';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill();
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Select::make('product_id')
                    ->label('Sản phẩm')
                    ->options(Product::pluck('name', 'id'))
                    ->required(),
                FileUpload::make('accounts_file')
                    ->label('File tài khoản (.txt)')
                    ->acceptedFileTypes(['text/plain', '.txt'])
                    ->disk('public')
                    ->directory('uploads/accounts')
                    ->visibility('private')
                    ->nullable(),
                Textarea::make('accounts_text')
                    ->label('Hoặc nhập trực tiếp (mỗi dòng một tài khoản)')
                    ->rows(10)
                    ->placeholder('username|password|2FA|cookie' . "\n" . 'user2|pass2|2fa2|cookie2'),
            ])
            ->statePath('data');
    }

    public function upload(): void
    {
        $data = $this->form->getState();

        // Validation: phải có ít nhất một trong hai
        if (empty($data['accounts_file']) && empty($data['accounts_text'])) {
            Notification::make()
                ->title('Lỗi')
                ->body('Vui lòng upload file hoặc nhập tài khoản trực tiếp')
                ->danger()
                ->send();
            return;
        }

        $accounts = [];

        if (!empty($data['accounts_file'])) {
            try {
                // Sử dụng Storage facade để đọc file
                $content = Storage::disk('public')->get($data['accounts_file']);
                if (!$content) {
                    throw new \Exception('File trống hoặc không thể đọc');
                }
                $accounts = array_filter(explode("\n", $content));

                // Xóa file sau khi đọc xong
                Storage::disk('public')->delete($data['accounts_file']);
            } catch (\Exception $e) {
                Notification::make()
                    ->title('Lỗi đọc file')
                    ->body('Không thể đọc file: ' . $e->getMessage())
                    ->danger()
                    ->send();
                return;
            }
        } elseif (!empty($data['accounts_text'])) {
            $accounts = array_filter(explode("\n", $data['accounts_text']));
        }

        $imported = 0;
        foreach ($accounts as $accountLine) {
            $accountLine = trim($accountLine);
            if (empty($accountLine)) continue;

            // Phân tách theo dấu "|"
            $parts = explode('|', $accountLine);
            if (count($parts) < 2) continue; // Ít nhất phải có username và password

            $username = trim($parts[0]);
            $password = trim($parts[1]);

            // Lấy thông tin bổ sung nếu có
            $additionalInfo = '';
            if (count($parts) > 2) {
                $additionalParts = array_slice($parts, 2);
                $additionalInfo = implode('|', $additionalParts);
            }

            Account::create([
                'product_id' => $data['product_id'],
                'username' => $username,
                'password' => $password,
                'additional_info' => $additionalInfo,
                'account_data' => $accountLine, // Lưu toàn bộ dòng gốc
                'status' => 'available',
            ]);

            $imported++;
        }

        // Update available count
        $product = Product::find($data['product_id']);
        $product->update([
            'available_count' => $product->availableAccounts()->count()
        ]);

        Notification::make()
            ->title("Đã import thành công {$imported} tài khoản")
            ->success()
            ->send();

        $this->form->fill();
    }
}
