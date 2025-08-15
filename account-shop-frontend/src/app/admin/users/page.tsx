'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBalance, setEditingBalance] = useState<number | null>(null);
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockUsers: User[] = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          phone: '0123456789',
          balance: 500000,
          role: 'user',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          name: 'Admin User',
          email: 'admin@example.com',
          phone: '0987654321',
          balance: 1000000,
          role: 'admin',
          created_at: '2024-01-01T08:00:00Z',
          updated_at: '2024-01-01T08:00:00Z',
        },
        {
          id: 3,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '0111222333',
          balance: 250000,
          role: 'user',
          created_at: '2024-01-20T14:15:00Z',
          updated_at: '2024-01-20T14:15:00Z',
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async (userId: number) => {
    const amount = parseFloat(newBalance);
    if (isNaN(amount) || amount < 0) {
      toast.error('Vui lòng nhập số dư hợp lệ');
      return;
    }

    try {
      // Simulate API call - replace with actual API
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, balance: amount } : u
      ));
      
      toast.success('Cập nhật số dư thành công!');
      setEditingBalance(null);
      setNewBalance('');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật số dư');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">👥 Quản lý người dùng</h1>
          <p className="text-blue-100 text-lg">
            Xem và quản lý tất cả người dùng trong hệ thống
          </p>
        </div>

        {/* Search */}
        <div className="flex justify-between items-center">
          <div className="max-w-md flex-1">
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<MagnifyingGlassIcon />}
            />
          </div>
          
          <div className="ml-4">
            <Button
              onClick={() => window.open('http://127.0.0.1:8000/admin/users', '_blank')}
              variant="outline"
            >
              Mở Filament Admin
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Danh sách người dùng ({filteredUsers.length})</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số dư
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <UsersIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {userItem.email}
                            </div>
                            {userItem.phone && (
                              <div className="text-xs text-gray-400">
                                {userItem.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingBalance === userItem.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={newBalance}
                              onChange={(e) => setNewBalance(e.target.value)}
                              className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Số dư mới"
                            />
                            <Button
                              onClick={() => handleUpdateBalance(userItem.id)}
                              size="sm"
                            >
                              Lưu
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingBalance(null);
                                setNewBalance('');
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Hủy
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(userItem.balance)}
                            </span>
                            <Button
                              onClick={() => {
                                setEditingBalance(userItem.id);
                                setNewBalance(userItem.balance.toString());
                              }}
                              variant="ghost"
                              size="sm"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userItem.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {userItem.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(userItem.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => window.open(`http://127.0.0.1:8000/admin/users/${userItem.id}/edit`, '_blank')}
                            variant="outline"
                            size="sm"
                          >
                            Chỉnh sửa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
