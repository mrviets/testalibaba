'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Product } from '@/types';
import { productsAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TagIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'account' | 'tool'>('all');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchProducts();
  }, [user, router]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      const data = response.data.data || response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || product.product_type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleEditTutorial = (productId: number) => {
    router.push(`/admin/products/${productId}/tutorial`);
  };

  const handleEditProduct = (productId: number) => {
    router.push(`/admin/products/${productId}/edit`);
  };

  const handleCreateProduct = () => {
    router.push('/admin/products/create');
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

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🛍️ Quản lý sản phẩm</h1>
              <p className="text-blue-100 text-lg">
                Quản lý sản phẩm, tutorial và hướng dẫn sử dụng
              </p>
            </div>
            <Button 
              onClick={handleCreateProduct}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TagIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TagIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tài khoản</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.product_type === 'account').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <WrenchScrewdriverIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tools</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.product_type === 'tool').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpenIcon className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Có tutorial</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.tutorial_content || p.tutorial_video_url).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={selectedType === 'all' ? 'primary' : 'outline'}
                  onClick={() => setSelectedType('all')}
                  size="sm"
                >
                  Tất cả
                </Button>
                <Button
                  variant={selectedType === 'account' ? 'primary' : 'outline'}
                  onClick={() => setSelectedType('account')}
                  size="sm"
                >
                  Tài khoản
                </Button>
                <Button
                  variant={selectedType === 'tool' ? 'primary' : 'outline'}
                  onClick={() => setSelectedType('tool')}
                  size="sm"
                >
                  Tools
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredProducts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Thử tìm kiếm với từ khóa khác'
                    : 'Thêm sản phẩm đầu tiên để bắt đầu'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreateProduct}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Thêm sản phẩm
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          product.product_type === 'tool' 
                            ? 'bg-purple-100 text-purple-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {product.product_type === 'tool' ? (
                            <WrenchScrewdriverIcon className="w-5 h-5" />
                          ) : (
                            <TagIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {product.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.product_type === 'tool'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {product.product_type === 'tool' ? '🛠️ Tool' : '🎯 Account'}
                            </span>
                            <span>ID: {product.id}</span>
                            <span>Cập nhật: {formatDate(product.updated_at)}</span>
                          </div>
                        </div>
                      </div>

                      {product.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Giá:</span>
                          <div className="font-semibold text-green-600">
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Có sẵn:</span>
                          <div className="font-semibold">
                            {product.available_count}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Tổng:</span>
                          <div className="font-semibold">
                            {product.total_count || product.available_count}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Tutorial:</span>
                          <div className={`font-semibold ${
                            product.tutorial_content || product.tutorial_video_url
                              ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {product.tutorial_content || product.tutorial_video_url ? '✅ Có' : '❌ Chưa'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Button
                        onClick={() => handleEditProduct(product.id)}
                        variant="outline"
                        size="sm"
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Sửa
                      </Button>

                      {product.product_type === 'tool' && (
                        <Button
                          onClick={() => handleEditTutorial(product.id)}
                          variant="outline"
                          size="sm"
                          className="text-purple-600 border-purple-600 hover:bg-purple-50"
                        >
                          <BookOpenIcon className="w-4 h-4 mr-2" />
                          Tutorial
                        </Button>
                      )}

                      <Button
                        onClick={() => router.push(`/tutorial/${product.id}`)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Xem
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
