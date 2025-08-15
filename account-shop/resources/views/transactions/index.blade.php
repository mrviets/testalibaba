<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Lịch sử giao dịch') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    @if($transactions->count() > 0)
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loại
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số tiền
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mô tả
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    @foreach($transactions as $transaction)
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    @if($transaction->type === 'deposit') bg-green-100 text-green-800
                                                    @elseif($transaction->type === 'purchase') bg-red-100 text-red-800
                                                    @else bg-blue-100 text-blue-800 @endif">
                                                    @switch($transaction->type)
                                                        @case('deposit') Nạp tiền @break
                                                        @case('purchase') Mua hàng @break
                                                        @case('refund') Hoàn tiền @break
                                                        @default {{ $transaction->type }}
                                                    @endswitch
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span class="@if($transaction->amount > 0) text-green-600 @else text-red-600 @endif font-semibold">
                                                    @if($transaction->amount > 0) + @endif{{ number_format($transaction->amount, 0, ',', '.') }} VNĐ
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 text-sm text-gray-900">
                                                {{ $transaction->description }}
                                                @if($transaction->reference_code)
                                                    <br><small class="text-gray-500">Mã: {{ $transaction->reference_code }}</small>
                                                @endif
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    @if($transaction->status === 'completed') bg-green-100 text-green-800
                                                    @elseif($transaction->status === 'pending') bg-yellow-100 text-yellow-800
                                                    @elseif($transaction->status === 'failed') bg-red-100 text-red-800
                                                    @else bg-gray-100 text-gray-800 @endif">
                                                    @switch($transaction->status)
                                                        @case('completed') Hoàn thành @break
                                                        @case('pending') Chờ xử lý @break
                                                        @case('failed') Thất bại @break
                                                        @case('cancelled') Đã hủy @break
                                                        @default {{ $transaction->status }}
                                                    @endswitch
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {{ $transaction->created_at->format('d/m/Y H:i') }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="text-center py-12">
                            <p class="text-gray-500 text-lg">Bạn chưa có giao dịch nào.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
