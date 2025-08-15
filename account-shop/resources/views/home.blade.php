<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                {{ __('🛒 Cửa hàng tài khoản số') }}
            </h2>
            @auth
                <div class="text-right">
                    <p class="text-sm text-gray-600">Số dư của bạn</p>
                    <p class="text-lg font-bold text-green-600">
                        {{ number_format(auth()->user()->balance, 0, ',', '.') }} VNĐ
                    </p>
                </div>
            @endauth
        </div>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @if(session('success'))
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    {{ session('success') }}
                </div>
            @endif

            @if(session('error'))
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {{ session('error') }}
                </div>
            @endif

            @if(auth()->check())
                <!-- Thông tin số dư chi tiết -->
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden shadow-lg sm:rounded-lg mb-8">
                    <div class="p-6 text-white">
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="text-blue-100 text-sm">💰 Số dư hiện tại</p>
                                <p class="text-3xl font-bold">
                                    {{ number_format(auth()->user()->balance, 0, ',', '.') }} VNĐ
                                </p>
                                <p class="text-blue-100 text-sm mt-1">
                                    Chào mừng, {{ auth()->user()->name }}!
                                </p>
                            </div>
                            <div class="text-right">
                                <a href="{{ route('dashboard') }}" class="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 inline-block mb-2">
                                    💳 Nạp tiền
                                </a>
                                <br>
                                <a href="{{ route('orders.history') }}" class="bg-blue-400 hover:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition duration-300 text-sm">
                                    📋 Lịch sử mua hàng
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            @else
                <!-- Banner cho khách chưa đăng nhập -->
                <div class="bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden shadow-lg sm:rounded-lg mb-8">
                    <div class="p-8 text-white text-center">
                        <h3 class="text-2xl font-bold mb-2">🎮 Chào mừng đến với cửa hàng tài khoản số!</h3>
                        <p class="text-indigo-100 mb-4">Mua bán tài khoản game, ứng dụng uy tín, giá rẻ</p>
                        <div class="space-x-4">
                            <a href="{{ route('register') }}" class="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-6 rounded-lg shadow-md transition duration-300">
                                📝 Đăng ký ngay
                            </a>
                            <a href="{{ route('login') }}" class="bg-indigo-400 hover:bg-indigo-300 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                                🔑 Đăng nhập
                            </a>
                        </div>
                    </div>
                </div>
            @endif

            <!-- Danh sách sản phẩm -->
            <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-6">🎮 Sản phẩm nổi bật</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                @forelse($products as $product)
                    <div class="bg-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl border border-gray-100">
                        <!-- Product Image -->
                        <div class="relative">
                            @if($product->image)
                                <img src="{{ asset('storage/' . $product->image) }}" alt="{{ $product->name }}" class="w-full h-48 object-cover">
                            @else
                                <div class="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                    <span class="text-white font-bold text-lg">{{ $product->name }}</span>
                                </div>
                            @endif

                            <!-- Stock badge -->
                            <div class="absolute top-3 right-3">
                                @if($product->available_accounts_count > 10)
                                    <span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        ✅ Còn hàng
                                    </span>
                                @elseif($product->available_accounts_count > 0)
                                    <span class="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        ⚠️ Sắp hết
                                    </span>
                                @else
                                    <span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        ❌ Hết hàng
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="p-6">
                            <!-- Product Name -->
                            <h3 class="text-xl font-bold mb-2 text-gray-800">{{ $product->name }}</h3>

                            <!-- Description -->
                            @if($product->description)
                                <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ Str::limit($product->description, 80) }}</p>
                            @endif

                            <!-- Price and Stock -->
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <span class="text-2xl font-bold text-red-600">
                                        {{ number_format($product->price, 0, ',', '.') }}₫
                                    </span>
                                    <p class="text-xs text-gray-500">Giá mỗi tài khoản</p>
                                </div>
                                <div class="text-right">
                                    <span class="text-lg font-semibold text-blue-600">
                                        {{ $product->available_accounts_count }}
                                    </span>
                                    <p class="text-xs text-gray-500">Tài khoản có sẵn</p>
                                </div>
                            </div>

                            @auth
                                @if($product->available_accounts_count > 0)
                                    <form action="{{ route('orders.store') }}" method="POST" class="space-y-3">
                                        @csrf
                                        <input type="hidden" name="product_id" value="{{ $product->id }}">

                                        <!-- Quantity Selector -->
                                        <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                            <label class="text-sm font-medium text-gray-700">Số lượng:</label>
                                            <div class="flex items-center space-x-2">
                                                <button type="button" onclick="decreaseQuantity({{ $product->id }})" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded">
                                                    -
                                                </button>
                                                <input type="number" name="quantity" id="quantity_{{ $product->id }}" value="1" min="1" max="{{ $product->available_accounts_count }}" class="w-16 text-center border border-gray-300 rounded py-1">
                                                <button type="button" onclick="increaseQuantity({{ $product->id }})" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded">
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Total Price Display -->
                                        <div class="bg-blue-50 rounded-lg p-3 text-center">
                                            <p class="text-sm text-gray-600">Tổng tiền:</p>
                                            <p class="text-lg font-bold text-blue-600" id="total_{{ $product->id }}">
                                                {{ number_format($product->price, 0, ',', '.') }}₫
                                            </p>
                                        </div>

                                        <!-- Buy Button -->
                                        @if(auth()->user()->balance >= $product->price)
                                            <button type="submit" class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md">
                                                🛒 Mua ngay
                                            </button>
                                        @else
                                            <button disabled class="w-full bg-gray-400 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed">
                                                💰 Số dư không đủ
                                            </button>
                                        @endif
                                    </form>
                                @else
                                    <button disabled class="w-full bg-gray-400 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed">
                                        ❌ Hết hàng
                                    </button>
                                @endif
                            @else
                                <a href="{{ route('login') }}" class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg text-center block transition duration-300 shadow-md">
                                    🔑 Đăng nhập để mua
                                </a>
                            @endauth
                        </div>
                    </div>
                @empty
                    <div class="col-span-full text-center py-16">
                        <div class="text-6xl mb-4">🛒</div>
                        <p class="text-gray-500 text-xl mb-2">Hiện tại chưa có sản phẩm nào</p>
                        <p class="text-gray-400">Vui lòng quay lại sau!</p>
                    </div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- JavaScript for quantity controls -->
    <script>
        function increaseQuantity(productId) {
            const input = document.getElementById('quantity_' + productId);
            const max = parseInt(input.getAttribute('max'));
            const current = parseInt(input.value);

            if (current < max) {
                input.value = current + 1;
                updateTotal(productId);
            }
        }

        function decreaseQuantity(productId) {
            const input = document.getElementById('quantity_' + productId);
            const current = parseInt(input.value);

            if (current > 1) {
                input.value = current - 1;
                updateTotal(productId);
            }
        }

        function updateTotal(productId) {
            const quantity = parseInt(document.getElementById('quantity_' + productId).value);
            const pricePerUnit = {{ json_encode($products->pluck('price', 'id')) }};
            const total = quantity * pricePerUnit[productId];

            document.getElementById('total_' + productId).textContent =
                new Intl.NumberFormat('vi-VN').format(total) + '₫';
        }

        // Add event listeners for manual input changes
        document.addEventListener('DOMContentLoaded', function() {
            @foreach($products as $product)
                document.getElementById('quantity_{{ $product->id }}').addEventListener('input', function() {
                    updateTotal({{ $product->id }});
                });
            @endforeach
        });
    </script>
</x-app-layout>
