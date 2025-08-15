'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Product, Order } from '@/types';
import { productsAPI, ordersAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  BookOpenIcon, 
  PlayIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function TutorialPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = parseInt(params.productId as string);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!productId) {
      router.push('/products');
      return;
    }
    
    fetchData();
  }, [user, productId, router]);

  const fetchData = async () => {
    try {
      // Fetch product details
      const productResponse = await productsAPI.getById(productId);
      const productData = productResponse.data.data || productResponse.data;
      setProduct(productData);

      // Check if user has purchased this product
      const ordersResponse = await ordersAPI.getMyOrders();
      const orders = ordersResponse.data.data || ordersResponse.data;
      setUserOrders(orders);
      
      const hasPurchased = orders.some((order: Order) => 
        order.product_id === productId && order.status === 'completed'
      );
      setHasAccess(hasPurchased);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    router.push('/products');
  };

  const downloadTool = () => {
    if (!product?.download_file_url) {
      toast.error('Chưa có link download cho tool này');
      return;
    }

    // Open download URL in new tab
    window.open(product.download_file_url, '_blank');
    toast.success('Đang chuyển đến trang download...');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h1>
          <Button onClick={() => router.push('/products')}>
            Quay lại danh sách sản phẩm
          </Button>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Access Denied */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <LockClosedIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-900 mb-2">
                Cần mua sản phẩm để xem hướng dẫn
              </h1>
              <p className="text-red-700 mb-6">
                Bạn cần mua <strong>{product.name}</strong> để có thể xem hướng dẫn sử dụng chi tiết.
              </p>
              
              <div className="bg-white p-6 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.available_count} có sẵn
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handlePurchase} size="lg">
                Mua ngay để xem hướng dẫn
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🛠️ {product.name}</h1>
              <p className="text-green-100 text-lg">
                Hướng dẫn sử dụng chi tiết và download tool
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 inline mr-2" />
                Đã mua sản phẩm
              </div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">📥 Download Tool</h2>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {product.download_file_name || `${product.name} - Phiên bản mới nhất`}
                  </h3>
                  <p className="text-blue-800 font-medium text-sm">
                    {product.download_requirements || `File size: ${product.download_file_size || '~50MB'} | Hỗ trợ: Windows 10/11 | Cập nhật: ${formatDate(product.updated_at)}`}
                  </p>
                </div>
                <Button
                  onClick={downloadTool}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!product.download_file_url}
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Download Tool
                </Button>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Lưu ý quan trọng:</h4>
                  {product.download_instructions ? (
                    <div className="text-yellow-800 font-medium space-y-1 text-sm whitespace-pre-line">
                      {product.download_instructions}
                    </div>
                  ) : (
                    <ul className="text-yellow-800 font-medium space-y-1 text-sm">
                      <li>• Tắt antivirus trước khi cài đặt (tool có thể bị nhận diện nhầm)</li>
                      <li>• Chạy với quyền Administrator để tool hoạt động đầy đủ</li>
                      <li>• Backup dữ liệu quan trọng trước khi sử dụng</li>
                      <li>• Chỉ sử dụng cho mục đích cá nhân, không chia sẻ</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Tutorial */}
        {product.tutorial_video_url && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">📹 Video hướng dẫn</h2>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={product.tutorial_video_url}
                  className="w-full h-full"
                  allowFullScreen
                  title="Tutorial Video"
                />
              </div>
              <p className="text-gray-600 text-sm mt-3">
                💡 Xem video để hiểu cách sử dụng tool một cách hiệu quả nhất
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step by Step Guide */}
        {product.tutorial_steps && product.tutorial_steps.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">📋 Hướng dẫn từng bước</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.tutorial_steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start space-x-4 p-4 rounded-lg cursor-pointer transition-colors ${
                      activeStep === index 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${
                      activeStep === index 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`${activeStep === index ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                        {step}
                      </p>
                    </div>
                    {activeStep === index && (
                      <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Tutorial */}
        {product.tutorial_content && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">📖 Hướng dẫn chi tiết</h2>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm">
                  {product.tutorial_content}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Support & Contact */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">🆘 Hỗ trợ kỹ thuật</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">📞 Liên hệ hỗ trợ</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <p>• Telegram: @support_tool</p>
                  <p>• Email: support@toolshop.com</p>
                  <p>• Hotline: 0123.456.789</p>
                  <p>• Thời gian: 8h-22h hàng ngày</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🔄 Cập nhật & Bảo hành</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Cập nhật miễn phí trong 6 tháng</p>
                  <p>• Bảo hành lỗi tool trong 30 ngày</p>
                  <p>• Hướng dẫn setup 1-1 nếu cần</p>
                  <p>• Thay thế tool nếu không hoạt động</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <ArrowDownTrayIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Download lại</h3>
              <p className="text-sm text-gray-600 mb-4">
                Tải lại tool nếu bị mất file
              </p>
              <Button onClick={downloadTool} variant="outline" size="sm">
                Download
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <BookOpenIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Xem lại hướng dẫn</h3>
              <p className="text-sm text-gray-600 mb-4">
                Đọc lại tutorial khi cần
              </p>
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                variant="outline"
                size="sm"
              >
                Lên đầu trang
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <ClockIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Mua thêm tool</h3>
              <p className="text-sm text-gray-600 mb-4">
                Khám phá các tool khác
              </p>
              <Button
                onClick={() => router.push('/products')}
                variant="outline"
                size="sm"
              >
                Xem sản phẩm
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
