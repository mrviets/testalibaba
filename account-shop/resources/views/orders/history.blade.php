<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            📋 {{ __('Lịch sử đơn hàng') }}
        </h2>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @if($orders->count() > 0)
                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-gradient-to-r from-green-500 to-green-600 overflow-hidden shadow-lg rounded-lg">
                        <div class="p-6 text-white">
                            <div class="flex items-center">
                                <div class="text-3xl">✅</div>
                                <div class="ml-4">
                                    <p class="text-green-100 text-sm">Đơn hàng hoàn thành</p>
                                    <p class="text-2xl font-bold">{{ $orders->where('status', 'completed')->count() }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-lg">
                        <div class="p-6 text-white">
                            <div class="flex items-center">
                                <div class="text-3xl">💰</div>
                                <div class="ml-4">
                                    <p class="text-blue-100 text-sm">Tổng chi tiêu</p>
                                    <p class="text-2xl font-bold">{{ number_format($orders->where('status', 'completed')->sum('amount'), 0, ',', '.') }}₫</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-purple-500 to-purple-600 overflow-hidden shadow-lg rounded-lg">
                        <div class="p-6 text-white">
                            <div class="flex items-center">
                                <div class="text-3xl">🎮</div>
                                <div class="ml-4">
                                    <p class="text-purple-100 text-sm">Tài khoản đã mua</p>
                                    <p class="text-2xl font-bold">{{ $orders->where('status', 'completed')->sum('quantity') }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Download Actions -->
                <div class="bg-white overflow-hidden shadow-lg sm:rounded-lg mb-6">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">📥 Tải xuống tài khoản</h3>
                        <div class="flex flex-wrap gap-4">
                            <a href="{{ route('download.all') }}" class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md">
                                📥 Tải tất cả tài khoản
                            </a>
                            <button onclick="downloadSelected()" class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md">
                                📦 Tải tài khoản đã chọn
                            </button>
                            <button onclick="selectAll()" class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md">
                                ✅ Chọn tất cả
                            </button>
                            <button onclick="deselectAll()" class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md">
                                ❌ Bỏ chọn tất cả
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Orders List -->
                <div class="bg-white overflow-hidden shadow-lg sm:rounded-lg">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-6">📋 Danh sách đơn hàng</h3>

                        <form id="downloadForm" action="{{ route('download.multiple') }}" method="POST" style="display: none;">
                            @csrf
                        </form>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input type="checkbox" id="selectAllCheckbox" onchange="toggleAll()" class="rounded">
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            🏷️ Mã đơn hàng
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            🎮 Sản phẩm
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            📊 Số lượng
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            💰 Giá
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            📈 Trạng thái
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            📅 Ngày mua
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            🔑 Tài khoản
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            📥 Tải xuống
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    @foreach($orders as $order)
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                @if($order->account && $order->status === 'completed')
                                                    <input type="checkbox" name="order_ids[]" value="{{ $order->id }}" class="order-checkbox rounded">
                                                @endif
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                {{ $order->order_code }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                {{ $order->product->name }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                    {{ $order->quantity ?? 1 }}x
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                {{ number_format($order->amount, 0, ',', '.') }}₫
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    @if($order->status === 'completed') bg-green-100 text-green-800
                                                    @elseif($order->status === 'pending') bg-yellow-100 text-yellow-800
                                                    @elseif($order->status === 'failed') bg-red-100 text-red-800
                                                    @else bg-gray-100 text-gray-800 @endif">
                                                    @switch($order->status)
                                                        @case('completed') ✅ Hoàn thành @break
                                                        @case('pending') ⏳ Chờ xử lý @break
                                                        @case('failed') ❌ Thất bại @break
                                                        @case('refunded') 💸 Đã hoàn tiền @break
                                                        @default {{ $order->status }}
                                                    @endswitch
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div>
                                                    <p class="font-medium">{{ $order->created_at->format('d/m/Y') }}</p>
                                                    <p class="text-gray-500 text-xs">{{ $order->created_at->format('H:i') }}</p>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-sm text-gray-900">
                                                @if($order->account && $order->status === 'completed')
                                                    <div class="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200 max-w-xs">
                                                        @if($order->account->account_data)
                                                            <!-- Hiển thị dữ liệu gốc nếu có -->
                                                            <div class="space-y-1">
                                                                <p class="text-xs font-medium text-gray-600">🔑 Dữ liệu tài khoản:</p>
                                                                <div class="text-sm font-mono bg-white px-2 py-1 rounded border break-all">
                                                                    {{ $order->account->account_data }}
                                                                </div>
                                                            </div>
                                                        @else
                                                            <!-- Hiển thị theo format cũ -->
                                                            <div class="space-y-1">
                                                                <div class="flex items-center">
                                                                    <span class="text-xs font-medium text-gray-600 w-16">👤 User:</span>
                                                                    <span class="text-sm font-mono bg-white px-2 py-1 rounded border">{{ $order->account->username }}</span>
                                                                </div>
                                                                <div class="flex items-center">
                                                                    <span class="text-xs font-medium text-gray-600 w-16">🔒 Pass:</span>
                                                                    <span class="text-sm font-mono bg-white px-2 py-1 rounded border">{{ $order->account->password }}</span>
                                                                </div>
                                                                @if($order->account->additional_info)
                                                                    <div class="mt-2 pt-2 border-t border-green-200">
                                                                        <p class="text-xs text-gray-600 font-medium">ℹ️ Thông tin thêm:</p>
                                                                        <p class="text-xs text-gray-800 bg-white p-1 rounded mt-1">{{ $order->account->additional_info }}</p>
                                                                    </div>
                                                                @endif
                                                            </div>
                                                        @endif
                                                    </div>
                                                @else
                                                    <span class="text-gray-400 text-sm">⏳ Chưa có thông tin</span>
                                                @endif
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                                @if($order->account && $order->status === 'completed')
                                                    <a href="{{ route('download.order', $order->id) }}" class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-1 px-3 rounded-lg transition duration-300 text-xs">
                                                        📥 Tải
                                                    </a>
                                                @else
                                                    <span class="text-gray-400 text-xs">Không khả dụng</span>
                                                @endif
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            @else
                <!-- Empty State -->
                <div class="bg-white overflow-hidden shadow-lg sm:rounded-lg">
                    <div class="text-center py-16">
                        <div class="text-6xl mb-4">🛒</div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
                        <p class="text-gray-500 mb-6">Bạn chưa mua sản phẩm nào. Hãy khám phá cửa hàng của chúng tôi!</p>
                        <a href="{{ route('home') }}" class="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md">
                            🛍️ Bắt đầu mua sắm
                        </a>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <!-- JavaScript for download functionality -->
    <script>
        function toggleAll() {
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            const orderCheckboxes = document.querySelectorAll('.order-checkbox');

            orderCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        }

        function selectAll() {
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            const orderCheckboxes = document.querySelectorAll('.order-checkbox');

            selectAllCheckbox.checked = true;
            orderCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        }

        function deselectAll() {
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            const orderCheckboxes = document.querySelectorAll('.order-checkbox');

            selectAllCheckbox.checked = false;
            orderCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }

        function downloadSelected() {
            const checkedBoxes = document.querySelectorAll('.order-checkbox:checked');

            if (checkedBoxes.length === 0) {
                alert('Vui lòng chọn ít nhất một đơn hàng để tải xuống!');
                return;
            }

            const form = document.getElementById('downloadForm');

            // Clear existing inputs
            form.innerHTML = '@csrf';

            // Add selected order IDs
            checkedBoxes.forEach(checkbox => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'order_ids[]';
                input.value = checkbox.value;
                form.appendChild(input);
            });

            form.submit();
        }

        // Update select all checkbox when individual checkboxes change
        document.addEventListener('DOMContentLoaded', function() {
            const orderCheckboxes = document.querySelectorAll('.order-checkbox');
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');

            orderCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const checkedCount = document.querySelectorAll('.order-checkbox:checked').length;
                    const totalCount = orderCheckboxes.length;

                    selectAllCheckbox.checked = checkedCount === totalCount;
                    selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < totalCount;
                });
            });
        });
    </script>
</x-app-layout>
