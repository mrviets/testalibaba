<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Tài khoản của tôi') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <!-- Thông tin tài khoản -->
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                <div class="p-6 text-gray-900">
                    <h3 class="text-lg font-semibold mb-4">Thông tin tài khoản</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p><strong>Tên:</strong> {{ auth()->user()->name }}</p>
                            <p><strong>Email:</strong> {{ auth()->user()->email }}</p>
                            <p><strong>Số điện thoại:</strong> {{ auth()->user()->phone ?? 'Chưa cập nhật' }}</p>
                        </div>
                        <div>
                            <p><strong>Số dư hiện tại:</strong>
                                <span class="text-2xl font-bold text-green-600">
                                    {{ number_format(auth()->user()->balance, 0, ',', '.') }} VNĐ
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Nạp tiền -->
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                <div class="p-6 text-gray-900">
                    <h3 class="text-lg font-semibold mb-4">Nạp tiền</h3>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Thông tin chuyển khoản -->
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <p class="mb-2"><strong>Thông tin chuyển khoản:</strong></p>
                            <p><strong>Ngân hàng:</strong> Vietcombank</p>
                            <p><strong>Số tài khoản:</strong> 1234567890</p>
                            <p><strong>Chủ tài khoản:</strong> NGUYEN VAN A</p>
                            <p><strong>Nội dung:</strong> NAP {{ auth()->user()->id }}</p>
                            <p class="text-sm text-gray-600 mt-2">
                                Sau khi chuyển khoản, vui lòng điền form bên cạnh để thông báo cho admin.
                            </p>
                        </div>

                        <!-- Form thông báo nạp tiền -->
                        <div>
                            <form action="{{ route('transactions.store') }}" method="POST" class="space-y-4">
                                @csrf
                                <div>
                                    <label for="amount" class="block text-sm font-medium text-gray-700">Số tiền đã chuyển</label>
                                    <input type="number" name="amount" id="amount" min="10000" step="1000" required
                                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                           placeholder="Ví dụ: 100000">
                                    <p class="text-xs text-gray-500 mt-1">Tối thiểu 10,000 VNĐ</p>
                                </div>

                                <div>
                                    <label for="reference_code" class="block text-sm font-medium text-gray-700">Mã giao dịch / Ghi chú</label>
                                    <input type="text" name="reference_code" id="reference_code" required
                                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                           placeholder="Mã giao dịch hoặc thời gian chuyển khoản">
                                </div>

                                <button type="submit" class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                    Thông báo đã chuyển khoản
                                </button>
                            </form>
                        </div>
                    </div>

                    <div class="mt-6">
                        <a href="{{ route('transactions.index') }}" class="text-blue-600 hover:text-blue-800">
                            Xem lịch sử giao dịch →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
