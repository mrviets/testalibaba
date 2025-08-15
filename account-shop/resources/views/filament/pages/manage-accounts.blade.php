<x-filament-panels::page>
    <div class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Upload tài khoản</h2>

            <form wire:submit="upload">
                {{ $this->form }}

                <div class="mt-6">
                    <x-filament::button type="submit" size="lg">
                        Upload tài khoản
                    </x-filament::button>
                </div>
            </form>
        </div>

        <div class="bg-blue-50 rounded-lg p-4">
            <h3 class="font-semibold text-blue-800 mb-2">🔧 Hướng dẫn upload tài khoản:</h3>
            <ul class="text-blue-700 text-sm space-y-1">
                <li>• <strong>Định dạng mới:</strong> username|password|2FA|cookie|... (phân cách bằng dấu "|")</li>
                <li>• <strong>Ví dụ:</strong> netflix_user1|password123|2FA_code|cookie_data</li>
                <li>• <strong>Tối thiểu:</strong> username|password (các thông tin khác là tùy chọn)</li>
                <li>• <strong>Mỗi dòng = 1 tài khoản</strong> - hệ thống sẽ đếm số dòng để biết số lượng</li>
                <li>• Bạn có thể upload file .txt hoặc nhập trực tiếp vào ô text</li>
                <li>• Hệ thống sẽ tự động cập nhật số lượng tài khoản có sẵn</li>
            </ul>
        </div>
    </div>
</x-filament-panels::page>
