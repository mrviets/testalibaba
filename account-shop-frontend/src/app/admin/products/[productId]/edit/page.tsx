'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Product } from '@/types';
import { productsAPI } from '@/lib/api';
import { 
  PencilIcon,
  ArrowLeftIcon,
  TagIcon,
  WrenchScrewdriverIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = parseInt(params.productId as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    product_type: 'account' as 'account' | 'tool',
    image_url: '',
    tutorial_content: '',
    tutorial_video_url: '',
    tutorial_steps: [] as string[],
    download_file_name: '',
    download_file_size: '',
    download_file_url: '',
    download_requirements: '',
    download_instructions: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    if (!productId) {
      router.push('/admin/products');
      return;
    }
    
    fetchProduct();
  }, [user, productId, router]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(productId);
      const productData = response.data.data || response.data;
      setProduct(productData);
      
      // Set form data
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price?.toString() || '',
        product_type: productData.product_type || 'account',
        image_url: productData.image_url || '',
        tutorial_content: productData.tutorial_content || '',
        tutorial_video_url: productData.tutorial_video_url || '',
        tutorial_steps: productData.tutorial_steps || [],
        download_file_name: productData.download_file_name || '',
        download_file_size: productData.download_file_size || '',
        download_file_url: productData.download_file_url || '',
        download_requirements: productData.download_requirements || '',
        download_instructions: productData.download_instructions || ''
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Vui lòng điền tên sản phẩm và giá');
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        tutorial_steps: formData.tutorial_steps.filter(step => step.trim() !== '')
      };

      await productsAPI.update(productId, submitData);
      toast.success('Cập nhật sản phẩm thành công!');
      router.push('/admin/products');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể cập nhật sản phẩm';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      await productsAPI.delete(productId);
      toast.success('Xóa sản phẩm thành công!');
      router.push('/admin/products');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể xóa sản phẩm';
      toast.error(message);
    }
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      tutorial_steps: [...prev.tutorial_steps, '']
    }));
  };

  const updateStep = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tutorial_steps: prev.tutorial_steps.map((step, i) => 
        i === index ? value : step
      )
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tutorial_steps: prev.tutorial_steps.filter((_, i) => i !== index)
    }));
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
          <Button onClick={() => router.push('/admin/products')}>
            Quay lại danh sách sản phẩm
          </Button>
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h1>
          <Button onClick={() => router.push('/')}>
            Quay về trang chủ
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">✏️ Chỉnh sửa sản phẩm</h1>
              <p className="text-orange-100 text-lg">
                {product.name}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => router.push(`/tutorial/${productId}`)}
                className="bg-white/20 hover:bg-white/30"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Xem
              </Button>
              {product.product_type === 'tool' && (
                <Button
                  onClick={() => router.push(`/admin/products/${productId}/tutorial`)}
                  className="bg-white/20 hover:bg-white/30"
                >
                  📖 Tutorial
                </Button>
              )}
              <Button
                onClick={() => router.push('/admin/products')}
                className="bg-white/20 hover:bg-white/30"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">📝 Thông tin cơ bản</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên sản phẩm *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên sản phẩm..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá (VNĐ) *
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Mô tả chi tiết về sản phẩm..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại sản phẩm *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="account"
                        checked={formData.product_type === 'account'}
                        onChange={(e) => setFormData(prev => ({ ...prev, product_type: e.target.value as 'account' | 'tool' }))}
                        className="mr-2"
                      />
                      <TagIcon className="w-4 h-4 mr-1" />
                      Tài khoản
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="tool"
                        checked={formData.product_type === 'tool'}
                        onChange={(e) => setFormData(prev => ({ ...prev, product_type: e.target.value as 'account' | 'tool' }))}
                        className="mr-2"
                      />
                      <WrenchScrewdriverIcon className="w-4 h-4 mr-1" />
                      Tool/Phần mềm
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Hình ảnh
                  </label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </div>
              </div>

              {/* Product Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{product.available_count}</div>
                  <div className="text-sm text-gray-600">Có sẵn</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{product.total_count || product.available_count}</div>
                  <div className="text-sm text-gray-600">Tổng số</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">#{product.id}</div>
                  <div className="text-sm text-gray-600">Product ID</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Section - Only for Tools */}
          {formData.product_type === 'tool' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">📥 Thông tin Download</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên file
                    </label>
                    <Input
                      value={formData.download_file_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, download_file_name: e.target.value }))}
                      placeholder="tool-name.exe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kích thước file
                    </label>
                    <Input
                      value={formData.download_file_size}
                      onChange={(e) => setFormData(prev => ({ ...prev, download_file_size: e.target.value }))}
                      placeholder="~50MB"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Download
                    </label>
                    <Input
                      value={formData.download_file_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, download_file_url: e.target.value }))}
                      placeholder="https://drive.google.com/file/d/..."
                      type="url"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yêu cầu hệ thống
                    </label>
                    <textarea
                      value={formData.download_requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, download_requirements: e.target.value }))}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Hỗ trợ: Windows 10/11 | Cập nhật: lúc 17:31 12 tháng 8, 2025"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lưu ý quan trọng
                    </label>
                    <textarea
                      value={formData.download_instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, download_instructions: e.target.value }))}
                      rows={6}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="⚠️ Lưu ý quan trọng:
• Tắt antivirus trước khi cài đặt (tool có thể bị nhận diện nhầm)
• Chạy với quyền Administrator để tool hoạt động đầy đủ
• Backup dữ liệu quan trọng trước khi sử dụng
• Chỉ sử dụng cho mục đích cá nhân, không chia sẻ"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              onClick={handleDelete}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Xóa sản phẩm
            </Button>

            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={() => router.push('/admin/products')}
                variant="outline"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                loading={saving}
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Cập nhật
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
