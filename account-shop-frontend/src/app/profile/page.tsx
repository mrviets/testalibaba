'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { UserIcon, EnvelopeIcon, PhoneIcon, CalendarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Cập nhật thông tin thành công!');
      setEditing(false);
      await refreshUser();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setEditing(false);
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">👤 Thông tin cá nhân</h1>
          <p className="text-indigo-100 text-lg">
            Quản lý thông tin tài khoản và cài đặt của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Thông tin tài khoản</h3>
                  <Button
                    onClick={() => setEditing(!editing)}
                    variant={editing ? 'secondary' : 'outline'}
                  >
                    {editing ? 'Hủy' : 'Chỉnh sửa'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                      label="Họ và tên"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      icon={<UserIcon />}
                      required
                    />

                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      icon={<EnvelopeIcon />}
                      required
                    />

                    <Input
                      label="Số điện thoại"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      icon={<PhoneIcon />}
                    />

                    <div className="flex space-x-4">
                      <Button
                        type="submit"
                        loading={loading}
                        className="flex-1"
                      >
                        Lưu thay đổi
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1"
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <UserIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Họ và tên</p>
                        <p className="font-medium text-gray-900">{user.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <EnvelopeIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <PhoneIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-medium text-gray-900">
                          {user.phone || 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="bg-yellow-100 p-3 rounded-full">
                        <CalendarIcon className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ngày tham gia</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Thống kê tài khoản</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Số dư hiện tại</span>
                      <span className="font-bold text-blue-900">
                        {formatCurrency(user.balance)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Vai trò</span>
                      <span className="font-bold text-green-900 capitalize">
                        {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700">Trạng thái</span>
                      <span className="font-bold text-purple-900">
                        Hoạt động
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Hành động nhanh</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/transactions')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    💰 Nạp tiền
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/orders')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    📦 Xem đơn hàng
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/products')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    🛒 Mua sắm
                  </Button>
                </div>
              </CardContent>
            </Card>

            {user.role === 'admin' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Quản trị</h3>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => window.open('http://127.0.0.1:8000/admin', '_blank')}
                    className="w-full"
                  >
                    🔧 Mở Admin Panel
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
