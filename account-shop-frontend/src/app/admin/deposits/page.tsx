'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { AutoDeposit } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  QrCodeIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminDepositsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [deposits, setDeposits] = useState<AutoDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchDeposits();
  }, [user, router]);

  const fetchDeposits = async () => {
    try {
      // Simulate API call - replace with actual admin API
      const mockDeposits: AutoDeposit[] = [
        {
          id: 1,
          user_id: 1,
          reference_code: 'NAP1T1691234567R1234',
          amount: 100000,
          bank_account: '1234567890',
          qr_code_url: 'https://img.vietqr.io/image/970422-1234567890-compact2.jpg',
          status: 'pending',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          user_id: 2,
          reference_code: 'NAP2T1691234568R5678',
          amount: 200000,
          bank_account: '1234567890',
          status: 'completed',
          webhook_transaction_id: 'TXN123456789',
          completed_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ];
      setDeposits(mockDeposits);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast.error('Không thể tải danh sách nạp tiền');
    } finally {
      setLoading(false);
    }
  };

  const handleManualComplete = async (depositId: number) => {
    const confirmed = window.confirm('Bạn có chắc muốn duyệt thủ công lệnh nạp tiền này?');
    if (!confirmed) return;

    try {
      // Simulate API call
      setDeposits(prev => prev.map(d => 
        d.id === depositId 
          ? { ...d, status: 'completed' as const, completed_at: new Date().toISOString() }
          : d
      ));
      
      toast.success('Đã duyệt lệnh nạp tiền thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi duyệt lệnh nạp tiền');
    }
  };

  const handleManualFail = async (depositId: number) => {
    const confirmed = window.confirm('Bạn có chắc muốn đánh dấu lệnh này là thất bại?');
    if (!confirmed) return;

    try {
      // Simulate API call
      setDeposits(prev => prev.map(d => 
        d.id === depositId 
          ? { ...d, status: 'failed' as const }
          : d
      ));
      
      toast.success('Đã đánh dấu lệnh nạp tiền thất bại!');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.reference_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'expired':
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const pendingCount = deposits.filter(d => d.status === 'pending').length;
  const completedCount = deposits.filter(d => d.status === 'completed').length;
  const expiredCount = deposits.filter(d => d.status === 'expired').length;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">⚡ Quản lý nạp tiền tự động</h1>
          <p className="text-orange-100 text-lg">
            Theo dõi và quản lý các lệnh nạp tiền VietQR
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Chờ thanh toán</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hết hạn</p>
                  <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng lệnh</p>
                  <p className="text-2xl font-bold text-gray-900">{deposits.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Tìm kiếm theo mã tham chiếu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<MagnifyingGlassIcon />}
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="completed">Hoàn thành</option>
                <option value="expired">Hết hạn</option>
                <option value="failed">Thất bại</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Deposits List */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Danh sách lệnh nạp tiền ({filteredDeposits.length})</h3>
          </CardHeader>
          <CardContent>
            {filteredDeposits.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <QrCodeIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy lệnh nạp tiền
                </h3>
                <p className="text-gray-600">
                  Thử thay đổi bộ lọc hoặc tìm kiếm
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDeposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(deposit.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          #{deposit.id} - {formatCurrency(deposit.amount)}
                        </h4>
                        <p className="text-sm text-gray-600 font-mono">
                          {deposit.reference_code}
                        </p>
                        <p className="text-xs text-gray-500">
                          User #{deposit.user_id} - {formatDate(deposit.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                          {deposit.status === 'pending' ? 'Chờ thanh toán' :
                           deposit.status === 'completed' ? 'Hoàn thành' :
                           deposit.status === 'expired' ? 'Hết hạn' : 'Thất bại'}
                        </span>
                        {deposit.status === 'pending' && (
                          <p className="text-xs text-red-500 mt-1">
                            Hết hạn: {formatDate(deposit.expires_at)}
                          </p>
                        )}
                        {deposit.webhook_transaction_id && (
                          <p className="text-xs text-blue-500 mt-1">
                            Auto: {deposit.webhook_transaction_id}
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        {deposit.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleManualComplete(deposit.id)}
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              Duyệt
                            </Button>
                            <Button
                              onClick={() => handleManualFail(deposit.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Webhook Info */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">🔗 Cấu hình Webhook</h3>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Webhook URLs để cấu hình:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">SePay Webhook:</span>
                  <code className="bg-white px-2 py-1 rounded text-blue-800">
                    http://127.0.0.1:8000/api/bank/sepay-webhook
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Casso Webhook:</span>
                  <code className="bg-white px-2 py-1 rounded text-blue-800">
                    http://127.0.0.1:8000/api/bank/casso-webhook
                  </code>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Cần cấu hình:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Cập nhật BANK_ACCOUNT_NUMBER trong .env</li>
                    <li>• Cập nhật SEPAY_SECRET_KEY trong .env</li>
                    <li>• Đăng ký webhook URL với SePay/Casso</li>
                    <li>• Test webhook với ngrok cho development</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
