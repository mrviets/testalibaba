'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { AutoDeposit } from '@/types';
import { autoDepositsAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  QrCodeIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AutoDepositPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [deposits, setDeposits] = useState<AutoDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [activeDeposit, setActiveDeposit] = useState<AutoDeposit | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchDeposits();
  }, [user, router]);

  const fetchDeposits = async () => {
    try {
      const response = await autoDepositsAPI.getMyDeposits();
      setDeposits(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast.error('Không thể tải danh sách nạp tiền');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10,000 VNĐ');
      return;
    }

    if (amount > 50000000) {
      toast.error('Số tiền nạp tối đa là 50,000,000 VNĐ');
      return;
    }

    setCreateLoading(true);

    try {
      const response = await autoDepositsAPI.create({ amount });
      const newDeposit = response.data.data;
      
      setActiveDeposit(newDeposit);
      setDeposits(prev => [newDeposit, ...prev]);
      setDepositAmount('');
      setShowCreateForm(false);
      
      toast.success('Tạo lệnh nạp tiền thành công! Vui lòng quét mã QR để thanh toán.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo lệnh nạp tiền';
      toast.error(message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCheckStatus = async (depositId: number) => {
    try {
      const response = await autoDepositsAPI.checkStatus(depositId);
      const updatedDeposit = response.data.data;
      
      setDeposits(prev => prev.map(d => 
        d.id === depositId ? updatedDeposit : d
      ));

      if (updatedDeposit.status === 'completed') {
        toast.success('Nạp tiền thành công!');
        await refreshUser();
        setActiveDeposit(null);
      } else if (updatedDeposit.status === 'expired') {
        toast.error('Lệnh nạp tiền đã hết hạn');
        setActiveDeposit(null);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã copy vào clipboard!');
  };

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Chờ thanh toán';
      case 'expired':
        return 'Hết hạn';
      case 'failed':
        return 'Thất bại';
      default:
        return status;
    }
  };

  if (!user) return null;

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
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">⚡ Nạp tiền tự động</h1>
          <p className="text-blue-100 text-lg">
            Nạp tiền nhanh chóng với VietQR - Tự động cộng tiền sau khi chuyển khoản
          </p>
        </div>

        {/* Create Deposit */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">💰 Tạo lệnh nạp tiền mới</h3>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant={showCreateForm ? 'secondary' : 'primary'}
              >
                {showCreateForm ? 'Hủy' : 'Nạp tiền ngay'}
              </Button>
            </div>
          </CardHeader>
          
          {showCreateForm && (
            <CardContent>
              <form onSubmit={handleCreateDeposit} className="space-y-4">
                <Input
                  label="Số tiền (VNĐ)"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Nhập số tiền muốn nạp"
                  min="10000"
                  max="50000000"
                  step="1000"
                  required
                />
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">✨ Ưu điểm nạp tiền tự động:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• ⚡ Tự động cộng tiền sau khi chuyển khoản (1-2 phút)</li>
                    <li>• 📱 Quét mã QR hoặc chuyển khoản thủ công</li>
                    <li>• 🔒 An toàn với mã tham chiếu duy nhất</li>
                    <li>• ⏰ Lệnh có hiệu lực trong 15 phút</li>
                    <li>• 💰 Số tiền: 10,000 - 50,000,000 VNĐ</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  loading={createLoading}
                  disabled={!depositAmount}
                  className="w-full"
                >
                  Tạo mã QR nạp tiền
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Active Deposit QR */}
        {activeDeposit && activeDeposit.status === 'pending' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900">
                  🔥 Lệnh nạp tiền đang chờ thanh toán
                </h3>
                <Button
                  onClick={() => handleCheckStatus(activeDeposit.id)}
                  variant="outline"
                  size="sm"
                >
                  Kiểm tra trạng thái
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Code */}
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    {activeDeposit.qr_code_url ? (
                      <img
                        src={activeDeposit.qr_code_url}
                        alt="VietQR Code"
                        className="w-64 h-64 mx-auto"
                      />
                    ) : (
                      <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                        <QrCodeIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    Quét mã QR bằng app ngân hàng
                  </p>
                </div>

                {/* Transfer Info */}
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin chuyển khoản:</h4>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Số tài khoản:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold">{activeDeposit.bank_account}</span>
                          <Button
                            onClick={() => copyToClipboard(activeDeposit.bank_account)}
                            variant="ghost"
                            size="sm"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Số tiền:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-green-600">
                            {formatCurrency(activeDeposit.amount)}
                          </span>
                          <Button
                            onClick={() => copyToClipboard(activeDeposit.amount.toString())}
                            variant="ghost"
                            size="sm"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Nội dung CK:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-blue-600">
                            {activeDeposit.reference_code}
                          </span>
                          <Button
                            onClick={() => copyToClipboard(activeDeposit.reference_code)}
                            variant="ghost"
                            size="sm"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Hết hạn:</span>
                        <span className="font-medium text-red-600">
                          {formatDate(activeDeposit.expires_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Lưu ý quan trọng:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Chuyển khoản ĐÚNG số tiền và nội dung</li>
                      <li>• Tiền sẽ tự động cộng sau 1-2 phút</li>
                      <li>• Lệnh hết hạn sau 15 phút</li>
                      <li>• Không chuyển khoản sau khi hết hạn</li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => setActiveDeposit(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deposits History */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📋 Lịch sử nạp tiền tự động</h3>
          </CardHeader>
          <CardContent>
            {deposits.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <CreditCardIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có lệnh nạp tiền nào
                </h3>
                <p className="text-gray-600">
                  Tạo lệnh nạp tiền đầu tiên của bạn
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {deposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(deposit.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Nạp tiền {formatCurrency(deposit.amount)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Mã: {deposit.reference_code}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(deposit.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                          {getStatusText(deposit.status)}
                        </span>
                        {deposit.status === 'pending' && (
                          <p className="text-xs text-red-500 mt-1">
                            Hết hạn: {formatDate(deposit.expires_at)}
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        {deposit.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => setActiveDeposit(deposit)}
                              variant="outline"
                              size="sm"
                            >
                              Xem QR
                            </Button>
                            <Button
                              onClick={() => handleCheckStatus(deposit.id)}
                              variant="ghost"
                              size="sm"
                            >
                              Kiểm tra
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

        {/* Instructions */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📖 Hướng dẫn sử dụng</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">🔥 Nạp tiền bằng QR Code:</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Nhập số tiền muốn nạp</li>
                  <li>2. Nhấn "Tạo mã QR nạp tiền"</li>
                  <li>3. Quét mã QR bằng app ngân hàng</li>
                  <li>4. Xác nhận chuyển khoản</li>
                  <li>5. Tiền tự động cộng sau 1-2 phút</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">💳 Chuyển khoản thủ công:</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Tạo lệnh nạp tiền</li>
                  <li>2. Copy thông tin chuyển khoản</li>
                  <li>3. Mở app ngân hàng</li>
                  <li>4. Chuyển khoản với nội dung chính xác</li>
                  <li>5. Chờ hệ thống xác nhận</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🎯 Lưu ý quan trọng:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Mỗi lệnh nạp tiền có mã tham chiếu riêng biệt</li>
                <li>• Phải chuyển khoản đúng nội dung để hệ thống nhận diện</li>
                <li>• Lệnh hết hạn sau 15 phút, cần tạo lệnh mới nếu quá hạn</li>
                <li>• Giới hạn 5 lệnh nạp tiền trong 1 giờ</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
