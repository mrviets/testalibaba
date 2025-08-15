'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { productsAPI } from '@/lib/api';
import { 
  PlusIcon,
  ArrowLeftIcon,
  TagIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CreateProductPage() {
  const { user } = useAuth();
  const router = useRouter();
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

      await productsAPI.create(submitData);
      toast.success('Tạo sản phẩm thành công!');
      router.push('/admin/products');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể tạo sản phẩm';
      toast.error(message);
    } finally {
      setSaving(false);
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
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">➕ Tạo sản phẩm mới</h1>
              <p className="text-green-100 text-lg">
                Thêm sản phẩm mới vào hệ thống
              </p>
            </div>
            <Button
              onClick={() => router.push('/admin/products')}
              className="bg-white/20 hover:bg-white/30"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
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
            </CardContent>
          </Card>

          {/* Tutorial Section - Only for Tools */}
          {formData.product_type === 'tool' && (
            <>
              {/* Video Tutorial */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">📹 Video hướng dẫn</h2>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Video (YouTube embed)
                    </label>
                    <Input
                      value={formData.tutorial_video_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, tutorial_video_url: e.target.value }))}
                      placeholder="https://www.youtube.com/embed/VIDEO_ID"
                      type="url"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Sử dụng embed URL cho YouTube
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Text Tutorial */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">📝 Hướng dẫn chi tiết</h2>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung hướng dẫn
                    </label>
                    <textarea
                      value={formData.tutorial_content}
                      onChange={(e) => setFormData(prev => ({ ...prev, tutorial_content: e.target.value }))}
                      rows={10}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                      placeholder="HƯỚNG DẪN SỬ DỤNG TOOL

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
                </CardContent>
              </Card>

              {/* Step by Step */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">📋 Các bước thực hiện</h2>
                    <Button type="button" onClick={addStep} size="sm">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Thêm bước
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formData.tutorial_steps.map((step, index) => (
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
                          type="button"
                          onClick={() => removeStep(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50 mt-1"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}

                    {formData.tutorial_steps.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Chưa có bước nào. Click "Thêm bước" để bắt đầu.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Download Section */}
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
            </>
          )}

          {/* Submit Actions */}
          <div className="flex justify-end space-x-4">
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
              <PlusIcon className="w-4 h-4 mr-2" />
              Tạo sản phẩm
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
