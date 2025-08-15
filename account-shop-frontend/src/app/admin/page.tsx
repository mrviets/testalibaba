'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CreditCardIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingTransactions: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    // Fetch admin stats
    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    // Simulate API call - replace with actual API
    setStats({
      totalUsers: 150,
      totalOrders: 1250,
      totalRevenue: 45000000,
      pendingTransactions: 12,
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">🔧 Admin Dashboard</h1>
          <p className="text-red-100 text-lg">
            Quản lý hệ thống AccountShop
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <ShoppingBagIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <CreditCardIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <UsersIcon className="w-5 h-5 mr-2 text-blue-600" />
                Quản lý người dùng
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Xem danh sách, chỉnh sửa thông tin và quản lý số dư người dùng
              </p>
              <Button
                onClick={() => window.open('http://127.0.0.1:8000/admin/users', '_blank')}
                className="w-full"
              >
                Mở quản lý Users
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-green-600" />
                Quản lý sản phẩm
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Thêm sản phẩm mới, cập nhật giá và quản lý tài khoản
              </p>
              <Button
                onClick={() => window.open('http://127.0.0.1:8000/admin/products', '_blank')}
                className="w-full"
              >
                Mở quản lý Products
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <ShoppingBagIcon className="w-5 h-5 mr-2 text-purple-600" />
                Quản lý đơn hàng
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Xem tất cả đơn hàng, trạng thái và lịch sử mua bán
              </p>
              <Button
                onClick={() => window.open('http://127.0.0.1:8000/admin/orders', '_blank')}
                className="w-full"
              >
                Mở quản lý Orders
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <CreditCardIcon className="w-5 h-5 mr-2 text-yellow-600" />
                Duyệt giao dịch
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Duyệt yêu cầu nạp tiền và quản lý giao dịch
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/admin/deposits')}
                  className="w-full"
                >
                  ⚡ Nạp tiền tự động
                </Button>
                <Button
                  onClick={() => window.open('http://127.0.0.1:8000/admin/transactions', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  Mở quản lý Transactions
                </Button>
                {stats.pendingTransactions > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm font-medium">
                      ⚠️ Có {stats.pendingTransactions} giao dịch chờ duyệt
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Quản lý tài khoản
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Upload tài khoản mới, quản lý inventory
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/admin/file-upload')}
                  className="w-full"
                >
                  📤 Upload file tài khoản
                </Button>
                <Button
                  onClick={() => router.push('/admin/upload')}
                  variant="outline"
                  className="w-full"
                >
                  📝 Paste text tài khoản
                </Button>
                <Button
                  onClick={() => window.open('http://127.0.0.1:8000/admin/accounts', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  Mở quản lý Accounts
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <CogIcon className="w-5 h-5 mr-2 text-gray-600" />
                Cài đặt hệ thống
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Cấu hình hệ thống, backup và bảo trì
              </p>
              <Button
                onClick={() => window.open('http://127.0.0.1:8000/admin', '_blank')}
                className="w-full"
                variant="outline"
              >
                Mở Filament Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📊 Hoạt động gần đây</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <UsersIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Người dùng mới đăng ký</p>
                    <p className="text-sm text-gray-600">5 phút trước</p>
                  </div>
                </div>
                <span className="text-blue-600 font-medium">+3 users</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <ShoppingBagIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Đơn hàng mới</p>
                    <p className="text-sm text-gray-600">10 phút trước</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">+8 orders</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <CreditCardIcon className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Yêu cầu nạp tiền</p>
                    <p className="text-sm text-gray-600">15 phút trước</p>
                  </div>
                </div>
                <span className="text-yellow-600 font-medium">Cần duyệt</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
