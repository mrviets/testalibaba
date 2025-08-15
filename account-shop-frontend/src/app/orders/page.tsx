'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Order } from '@/types';
import { ordersAPI, downloadAPI } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor, getStatusText, downloadFile } from '@/lib/utils';
import {
  ShoppingBagIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [downloadLoading, setDownloadLoading] = useState<number | null>(null);
  const [bulkDownloadLoading, setBulkDownloadLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOrder = async (orderId: number) => {
    setDownloadLoading(orderId);
    try {
      const response = await downloadAPI.downloadOrder(orderId);
      downloadFile(response.data, `order-${orderId}-accounts.txt`);
      toast.success('Tải tài khoản thành công!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể tải tài khoản';
      toast.error(message);
    } finally {
      setDownloadLoading(null);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Vui lòng chọn ít nhất một đơn hàng');
      return;
    }

    setBulkDownloadLoading(true);
    try {
      const response = await downloadAPI.downloadMultiple(selectedOrders);
      downloadFile(response.data, `selected-orders-accounts.txt`);
      toast.success(`Tải ${selectedOrders.length} đơn hàng thành công!`);
      setSelectedOrders([]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể tải tài khoản';
      toast.error(message);
    } finally {
      setBulkDownloadLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    if (completedOrders.length === 0) {
      toast.error('Không có đơn hàng hoàn thành nào để tải');
      return;
    }

    setBulkDownloadLoading(true);
    try {
      const response = await downloadAPI.downloadAll();
      downloadFile(response.data, `all-accounts.txt`);
      toast.success('Tải tất cả tài khoản thành công!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể tải tài khoản';
      toast.error(message);
    } finally {
      setBulkDownloadLoading(false);
    }
  };

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    if (selectedOrders.length === completedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(completedOrders.map(order => order.id));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
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

  const completedOrders = orders.filter(order => order.status === 'completed');
  const totalSpent = orders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.amount, 0);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">📦 Đơn hàng của tôi</h1>
          <p className="text-green-100 text-lg">
            Quản lý và tải xuống các tài khoản đã mua
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        {completedOrders.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === completedOrders.length && completedOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Chọn tất cả ({completedOrders.length})
                    </span>
                  </label>
                  
                  {selectedOrders.length > 0 && (
                    <span className="text-sm text-blue-600 font-medium">
                      Đã chọn {selectedOrders.length} đơn hàng
                    </span>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleBulkDownload}
                    disabled={selectedOrders.length === 0}
                    loading={bulkDownloadLoading}
                    variant="outline"
                    size="sm"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Tải đã chọn
                  </Button>

                  <Button
                    onClick={handleDownloadAll}
                    loading={bulkDownloadLoading}
                    size="sm"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Tải tất cả
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <ShoppingBagIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có đơn hàng nào
              </h3>
              <p className="text-gray-600 mb-4">
                Hãy mua sản phẩm đầu tiên của bạn
              </p>
              <Button onClick={() => router.push('/products')}>
                Xem sản phẩm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {order.status === 'completed' && (
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                      
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {order.product?.name || 'Sản phẩm'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Mã đơn: {order.order_code}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(order.amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          SL: {order.quantity}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      {order.status === 'completed' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleDownloadOrder(order.id)}
                            loading={downloadLoading === order.id}
                            size="sm"
                            variant="outline"
                          >
                            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                            Tải
                          </Button>

                          {order.product?.product_type === 'tool' && (
                            <Button
                              onClick={() => router.push(`/tutorial/${order.product_id}`)}
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <BookOpenIcon className="w-4 h-4 mr-2" />
                              Hướng dẫn
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {order.account && order.status === 'completed' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Thông tin tài khoản:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Username:</span>
                          <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                            {order.account.username}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Password:</span>
                          <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                            {order.account.password}
                          </span>
                        </div>
                        {order.account.account_data && (
                          <div className="md:col-span-2">
                            <span className="text-gray-600">Dữ liệu gốc:</span>
                            <div className="mt-1 font-mono bg-white p-2 rounded text-xs">
                              {order.account.account_data}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
