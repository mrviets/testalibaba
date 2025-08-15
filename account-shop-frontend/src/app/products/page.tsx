'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { productsAPI, ordersAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCartIcon, MagnifyingGlassIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});
  const [showTutorial, setShowTutorial] = useState<Product | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProducts();
  }, [user, router]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: number, price: number, quantity: number = 1) => {
    if (!user) return;

    const totalAmount = price * quantity;

    if (user.balance < totalAmount) {
      toast.error('Số dư không đủ! Vui lòng nạp thêm tiền.');
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn mua ${quantity} tài khoản với tổng giá ${formatCurrency(totalAmount)}?`
    );

    if (!confirmed) return;

    setPurchaseLoading(productId);

    try {
      const response = await ordersAPI.create({
        product_id: productId,
        quantity,
      });

      toast.success('Mua hàng thành công! Kiểm tra trong mục "Đơn hàng"');
      
      // Refresh user balance and products
      await refreshUser();
      await fetchProducts();
      
      // Redirect to orders page
      setTimeout(() => {
        router.push('/orders');
      }, 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi mua hàng';
      toast.error(message);
    } finally {
      setPurchaseLoading(null);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">🛒 Sản phẩm</h1>
          <p className="text-purple-100 text-lg">
            Khám phá các tài khoản chất lượng cao với giá cả hợp lý
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon />}
          />
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <ShoppingCartIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Các sản phẩm sẽ được cập nhật sớm'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPurchase={(productId, quantity) => handlePurchase(productId, product.price, quantity)}
                onViewTutorial={setShowTutorial}
                loading={purchaseLoading === product.id}
              />
            ))}
          </div>
        )}

        {/* Balance Warning */}
        {user.balance === 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-full mr-4">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800">Số dư tài khoản trống</h3>
                  <p className="text-yellow-700 text-sm">
                    Bạn cần nạp tiền để có thể mua sản phẩm.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/transactions')}
                  variant="outline"
                  className="ml-auto"
                >
                  Nạp tiền ngay
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    🛠️ Hướng dẫn sử dụng {showTutorial.name}
                  </h2>
                  <button
                    onClick={() => setShowTutorial(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Video Tutorial */}
                {showTutorial.tutorial_video_url && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">📹 Video hướng dẫn:</h3>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <iframe
                        src={showTutorial.tutorial_video_url}
                        className="w-full h-full"
                        allowFullScreen
                        title="Tutorial Video"
                      />
                    </div>
                  </div>
                )}

                {/* Text Tutorial */}
                {showTutorial.tutorial_content && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">📝 Hướng dẫn chi tiết:</h3>
                    <div className="prose max-w-none">
                      <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                        {showTutorial.tutorial_content}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step by Step */}
                {showTutorial.tutorial_steps && showTutorial.tutorial_steps.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">📋 Các bước thực hiện:</h3>
                    <div className="space-y-3">
                      {showTutorial.tutorial_steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 bg-blue-50 p-3 rounded-lg">
                            {step}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purchase CTA */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Sẵn sàng sử dụng {showTutorial.name}?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Mua ngay để nhận tài khoản và bắt đầu sử dụng
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setShowTutorial(null);
                        handlePurchase(showTutorial.id, showTutorial.price, 1);
                      }}
                      disabled={showTutorial.available_count === 0}
                    >
                      <ShoppingCartIcon className="w-4 h-4 mr-2" />
                      Mua ngay {formatCurrency(showTutorial.price)}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
