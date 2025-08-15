'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Transaction } from '@/types';
import { transactionsAPI } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { 
  CreditCardIcon, 
  PlusIcon, 
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTransactions();
  }, [user, router]);

  const fetchTransactions = async () => {
    try {
      const response = await transactionsAPI.getMyTransactions();
      setTransactions(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Không thể tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (amount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10,000 VNĐ');
      return;
    }

    setDepositLoading(true);

    try {
      await transactionsAPI.create({
        type: 'deposit',
        amount,
        description: `Nạp tiền vào tài khoản - ${formatCurrency(amount)}`,
      });

      toast.success('Yêu cầu nạp tiền đã được gửi! Chờ admin duyệt.');
      setDepositAmount('');
      setShowDepositForm(false);
      await fetchTransactions();
      await refreshUser();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi nạp tiền';
      toast.error(message);
    } finally {
      setDepositLoading(false);
    }
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'completed') {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    } else if (status === 'failed') {
      return <XCircleIcon className="w-5 h-5 text-red-600" />;
    } else {
      return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'refund':
        return 'text-green-600';
      case 'purchase':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === 'deposit' || type === 'refund' ? '+' : '-';
    return `${prefix}${formatCurrency(amount)}`;
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

  const completedDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed');
  const totalDeposited = completedDeposits.reduce((sum, t) => sum + t.amount, 0);
  const completedPurchases = transactions.filter(t => t.type === 'purchase' && t.status === 'completed');
  const totalSpent = completedPurchases.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">💳 Giao dịch</h1>
          <p className="text-emerald-100 text-lg">
            Nạp tiền và theo dõi lịch sử giao dịch của bạn
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BanknotesIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Số dư hiện tại</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(user.balance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <PlusIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đã nạp</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDeposited)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <CreditCardIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đã chi tiêu</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Giao dịch</p>
                  <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deposit Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">💰 Nạp tiền</h3>
              <Button
                onClick={() => setShowDepositForm(!showDepositForm)}
                variant={showDepositForm ? 'secondary' : 'primary'}
              >
                {showDepositForm ? 'Hủy' : 'Nạp tiền'}
              </Button>
            </div>
          </CardHeader>
          
          {showDepositForm && (
            <CardContent>
              <form onSubmit={handleDeposit} className="space-y-4">
                <Input
                  label="Số tiền (VNĐ)"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Nhập số tiền muốn nạp"
                  min="10000"
                  step="1000"
                  required
                />
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn nạp tiền:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Số tiền nạp tối thiểu: 10,000 VNĐ</li>
                    <li>• Sau khi gửi yêu cầu, admin sẽ duyệt trong vòng 24h</li>
                    <li>• Bạn sẽ nhận được thông báo khi giao dịch được duyệt</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  loading={depositLoading}
                  disabled={!depositAmount}
                  className="w-full"
                >
                  Gửi yêu cầu nạp tiền
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Transactions History */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📋 Lịch sử giao dịch</h3>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <CreditCardIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có giao dịch nào
                </h3>
                <p className="text-gray-600">
                  Lịch sử giao dịch của bạn sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getTransactionIcon(transaction.type, transaction.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {getStatusText(transaction.type)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {transaction.description}
                        </p>
                        {transaction.reference_code && (
                          <p className="text-xs text-gray-500">
                            Mã tham chiếu: {transaction.reference_code}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
