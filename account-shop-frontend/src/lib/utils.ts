import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return '0 ₫';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numAmount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'sold':
    case 'reserved':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return 'Hoàn thành';
    case 'pending':
      return 'Chờ xử lý';
    case 'failed':
      return 'Thất bại';
    case 'cancelled':
      return 'Đã hủy';
    case 'available':
      return 'Có sẵn';
    case 'sold':
      return 'Đã bán';
    case 'reserved':
      return 'Đã đặt';
    case 'deposit':
      return 'Nạp tiền';
    case 'purchase':
      return 'Mua hàng';
    case 'refund':
      return 'Hoàn tiền';
    default:
      return status;
  }
}
