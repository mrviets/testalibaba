'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Product } from '@/types';
import { productsAPI, adminAPI } from '@/lib/api';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminQuickUploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [textData, setTextData] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/');
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
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setTextData(content);
    
    // Count valid lines
    const lines = content.split('\n').filter(line => line.trim());
    setPreviewCount(lines.length);
  };

  const parseAccountData = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const accounts = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      let username = '';
      let password = '';
      let accountData = trimmedLine;

      // Support multiple formats
      if (trimmedLine.includes('|')) {
        const parts = trimmedLine.split('|');
        username = parts[0]?.trim() || '';
        password = parts[1]?.trim() || '';
      } else if (trimmedLine.includes(':')) {
        const parts = trimmedLine.split(':');
        username = parts[0]?.trim() || '';
        password = parts[1]?.trim() || '';
      } else if (trimmedLine.includes(' ')) {
        const parts = trimmedLine.split(' ');
        username = parts[0]?.trim() || '';
        password = parts[1]?.trim() || '';
      } else if (trimmedLine.includes('@')) {
        username = trimmedLine;
        password = 'default123';
      }

      if (username) {
        accounts.push({
          username,
          password: password || 'default123',
          account_data: accountData,
        });
      }
    }

    return accounts;
  };

  const handleUpload = async () => {
    if (!selectedProduct) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    if (!textData.trim()) {
      toast.error('Vui lòng nhập dữ liệu tài khoản');
      return;
    }

    setLoading(true);

    try {
      const accounts = parseAccountData(textData);
      
      if (accounts.length === 0) {
        toast.error('Không tìm thấy tài khoản hợp lệ trong dữ liệu');
        return;
      }

      if (accounts.length > 10000) {
        toast.error('Tối đa 10,000 tài khoản mỗi lần upload');
        return;
      }

      const response = await adminAPI.bulkUploadAccounts({
        product_id: selectedProduct,
        accounts: accounts
      });

      toast.success(response.data.message || `Upload thành công ${accounts.length} tài khoản!`);
      
      // Reset form
      setTextData('');
      setSelectedProduct(null);
      setPreviewCount(0);

    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi upload tài khoản';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleData = `netflix_user1|password123
netflix_user2|mypassword456
spotify_premium1|spotifypass789
youtube_user@gmail.com|ytpassword
steam_account1:steampass123
discord_user1 discordpass456
twitch_streamer|twitchpass|stream_key
adobe_user|adobepass|license_key`;
    
    setTextData(sampleData);
    handleTextChange({ target: { value: sampleData } } as any);
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">⚡ Upload nhanh tài khoản</h1>
          <p className="text-indigo-100 text-lg">
            Paste dữ liệu tài khoản trực tiếp và upload ngay lập tức
          </p>
        </div>

        {/* Quick Upload Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">🚀 Upload siêu nhanh</h3>
              <Button
                onClick={loadSampleData}
                variant="outline"
                size="sm"
              >
                📋 Load dữ liệu mẫu
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn sản phẩm: *
                </label>
                <select
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Hiện có: {product.available_count} tài khoản)
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Paste dữ liệu tài khoản: *
                  </label>
                  {previewCount > 0 && (
                    <span className="text-sm text-blue-600 font-medium">
                      {previewCount} tài khoản
                    </span>
                  )}
                </div>
                <textarea
                  value={textData}
                  onChange={handleTextChange}
                  placeholder="Paste dữ liệu tài khoản vào đây...

Ví dụ:
username1|password1
username2|password2
user@email.com:mypassword
account1 password1"
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                loading={loading}
                disabled={!selectedProduct || !textData.trim()}
                className="w-full"
                size="lg"
              >
                <ClipboardDocumentIcon className="w-5 h-5 mr-2" />
                {loading ? 'Đang upload...' : `Upload ${previewCount} tài khoản`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Chọn sản phẩm</h3>
              <p className="text-sm text-gray-600">
                Chọn sản phẩm muốn thêm tài khoản
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Paste dữ liệu</h3>
              <p className="text-sm text-gray-600">
                Copy/paste tài khoản theo format: username|password
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload ngay</h3>
              <p className="text-sm text-gray-600">
                Click upload và chờ hệ thống xử lý
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Format Examples */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📝 Format được hỗ trợ</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">✅ Format đơn giản:</h4>
                <pre className="text-sm text-gray-600 bg-white p-3 rounded">
{`username1|password1
username2|password2
user@email.com:mypassword
account1 password1`}
                </pre>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">🔥 Format phức tạp:</h4>
                <pre className="text-sm text-gray-600 bg-white p-3 rounded">
{`user1|pass1|2fa|cookie|data
user2|pass2|token|session|info
email@domain.com|password|additional_data`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
