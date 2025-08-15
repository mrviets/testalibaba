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
  BookOpenIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function EditTutorialPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = parseInt(params.productId as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Tutorial form data
  const [tutorialData, setTutorialData] = useState({
    tutorial_content: '',
    tutorial_video_url: '',
    tutorial_steps: [] as string[]
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
      
      // Set tutorial data
      setTutorialData({
        tutorial_content: productData.tutorial_content || '',
        tutorial_video_url: productData.tutorial_video_url || '',
        tutorial_steps: productData.tutorial_steps || []
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await productsAPI.update(productId, tutorialData);
      toast.success('Cập nhật tutorial thành công!');
      router.push('/admin/products');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể cập nhật tutorial';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    setTutorialData(prev => ({
      ...prev,
      tutorial_steps: [...prev.tutorial_steps, '']
    }));
  };

  const updateStep = (index: number, value: string) => {
    setTutorialData(prev => ({
      ...prev,
      tutorial_steps: prev.tutorial_steps.map((step, i) => 
        i === index ? value : step
      )
    }));
  };

  const removeStep = (index: number) => {
    setTutorialData(prev => ({
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📖 Chỉnh sửa Tutorial</h1>
              <p className="text-purple-100 text-lg">
                {product.name}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => router.push(`/tutorial/${productId}`)}
                className="bg-white/20 hover:bg-white/30"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Xem trước
              </Button>
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

        {/* Product Info */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">ℹ️ Thông tin sản phẩm</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Loại:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  product.product_type === 'tool'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {product.product_type === 'tool' ? '🛠️ Tool' : '🎯 Account'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Giá:</span>
                <span className="ml-2 font-semibold">{product.price.toLocaleString()}₫</span>
              </div>
              <div>
                <span className="text-gray-600">Có sẵn:</span>
                <span className="ml-2 font-semibold">{product.available_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Tutorial */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">📹 Video hướng dẫn</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Video (YouTube, Vimeo, etc.):
                </label>
                <Input
                  value={tutorialData.tutorial_video_url}
                  onChange={(e) => setTutorialData(prev => ({
                    ...prev,
                    tutorial_video_url: e.target.value
                  }))}
                  placeholder="https://www.youtube.com/embed/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Sử dụng embed URL cho YouTube: https://www.youtube.com/embed/VIDEO_ID
                </p>
              </div>

              {tutorialData.tutorial_video_url && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={tutorialData.tutorial_video_url}
                    className="w-full h-full"
                    allowFullScreen
                    title="Tutorial Video Preview"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Text Tutorial */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">📝 Hướng dẫn chi tiết</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung hướng dẫn:
                </label>
                <textarea
                  value={tutorialData.tutorial_content}
                  onChange={(e) => setTutorialData(prev => ({
                    ...prev,
                    tutorial_content: e.target.value
                  }))}
                  rows={15}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                  placeholder="Nhập nội dung hướng dẫn chi tiết...

Ví dụ:
HƯỚNG DẪN SỬ DỤNG TOOL

🎯 TÍNH NĂNG CHÍNH:
- Tính năng 1
- Tính năng 2

📋 CÁCH SỬ DỤNG:
Bước 1: ...
Bước 2: ...

💡 TIPS:
- Tip 1
- Tip 2"
                />
              </div>

              {tutorialData.tutorial_content && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
                  <div className="whitespace-pre-wrap text-sm font-mono bg-white p-3 rounded border max-h-40 overflow-y-auto">
                    {tutorialData.tutorial_content}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step by Step */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">📋 Các bước thực hiện</h2>
              <Button onClick={addStep} size="sm">
                <PlusIcon className="w-4 h-4 mr-2" />
                Thêm bước
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tutorialData.tutorial_steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder={`Mô tả bước ${index + 1}...`}
                    />
                  </div>
                  <Button
                    onClick={() => removeStep(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50 mt-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {tutorialData.tutorial_steps.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpenIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Chưa có bước nào. Click "Thêm bước" để bắt đầu.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            onClick={() => router.push('/admin/products')}
            variant="outline"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
          >
            <BookOpenIcon className="w-4 h-4 mr-2" />
            Lưu Tutorial
          </Button>
        </div>
      </div>
    </Layout>
  );
}
