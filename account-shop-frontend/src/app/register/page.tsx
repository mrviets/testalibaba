'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);

    const success = await register(formData);
    if (success) {
      router.push('/');
    }

    setLoading(false);
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AccountShop</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Đăng ký</h2>
          <p className="mt-2 text-gray-600">
            Tạo tài khoản mới để bắt đầu mua sắm tài khoản chất lượng cao.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Họ và tên"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                icon={<UserIcon />}
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email của bạn"
                icon={<EnvelopeIcon />}
                required
              />

              <Input
                label="Số điện thoại (tùy chọn)"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                icon={<PhoneIcon />}
              />

              <Input
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                icon={<LockClosedIcon />}
                required
              />

              <Input
                label="Xác nhận mật khẩu"
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                icon={<LockClosedIcon />}
                required
              />

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!formData.name || !formData.email || !formData.password || !formData.password_confirmation}
              >
                Đăng ký
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Đã có tài khoản?{' '}
                <Link
                  href="/login"
                  className="text-green-600 hover:text-green-500 font-medium"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <Link href="/terms" className="text-green-600 hover:text-green-500">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="text-green-600 hover:text-green-500">
              Chính sách bảo mật
            </Link>{' '}
            của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
