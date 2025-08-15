'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ShoppingCartIcon, CreditCardIcon, UserGroupIcon, TrophyIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = [
    {
      name: 'Sản phẩm có sẵn',
      value: '1,200+',
      icon: ShoppingCartIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Khách hàng hài lòng',
      value: '5,000+',
      icon: UserGroupIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Giao dịch thành công',
      value: '15,000+',
      icon: CreditCardIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Đánh giá 5 sao',
      value: '98%',
      icon: TrophyIcon,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Chào mừng trở lại, {user.name}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Khám phá các sản phẩm tài khoản chất lượng cao với giá cả hợp lý
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold">🛒 Mua sắm ngay</h3>
              <p className="text-gray-600">Khám phá các sản phẩm tài khoản hot nhất</p>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => router.push('/products')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xem sản phẩm
              </button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold">⚡ Nạp tiền tự động</h3>
              <p className="text-gray-600">VietQR - Tự động cộng tiền sau 1-2 phút</p>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => router.push('/auto-deposit')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Nạp tiền ngay
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold">✨ Tại sao chọn AccountShop?</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔒</span>
                </div>
                <h4 className="font-semibold mb-2">Bảo mật cao</h4>
                <p className="text-gray-600 text-sm">Tài khoản được kiểm tra kỹ lưỡng, đảm bảo an toàn</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="font-semibold mb-2">Giao hàng nhanh</h4>
                <p className="text-gray-600 text-sm">Nhận tài khoản ngay sau khi thanh toán thành công</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold mb-2">Hỗ trợ 24/7</h4>
                <p className="text-gray-600 text-sm">Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
