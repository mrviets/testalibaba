'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Product } from '@/types';
import { productsAPI } from '@/lib/api';
import { 
  DocumentArrowUpIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminFileUploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.txt')) {
      toast.error('Chỉ hỗ trợ file .txt');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      toast.error('File quá lớn. Tối đa 10MB');
      return;
    }

    setFile(selectedFile);
    toast.success(`Đã chọn file: ${selectedFile.name}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedProduct) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    if (!file) {
      toast.error('Vui lòng chọn file');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('product_id', selectedProduct.toString());
      formData.append('file', file);

      const token = localStorage.getItem('auth_token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/accounts/file-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      toast.success(result.message || 'Upload thành công!');
      
      // Reset form
      setFile(null);
      setSelectedProduct(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi upload file');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">📤 Upload file tài khoản</h1>
          <p className="text-purple-100 text-lg">
            Upload file .txt chứa hàng ngàn tài khoản một cách nhanh chóng
          </p>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📋 Upload tài khoản</h3>
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

              {/* File Drop Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn file tài khoản (.txt): *
                </label>
                
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  
                  {file ? (
                    <div>
                      <p className="text-green-600 font-medium">✅ {file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <Button
                        onClick={() => setFile(null)}
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                      >
                        Chọn file khác
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">
                        Kéo thả file vào đây hoặc click để chọn
                      </p>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        variant="outline"
                      >
                        Chọn file .txt
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                loading={loading}
                disabled={!selectedProduct || !file}
                className="w-full"
                size="lg"
              >
                <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                {loading ? 'Đang upload...' : 'Upload tài khoản'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">📖 Hướng dẫn format file</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">✅ Format được hỗ trợ:</h4>
                  <div className="text-sm text-green-800 space-y-2">
                    <div>
                      <strong>1. Pipe separated (|):</strong>
                      <code className="block bg-white p-2 rounded mt-1">
                        username1|password1<br/>
                        user@email.com|mypassword
                      </code>
                    </div>

                    <div>
                      <strong>2. Colon separated (:):</strong>
                      <code className="block bg-white p-2 rounded mt-1">
                        username1:password1<br/>
                        user@email.com:mypassword
                      </code>
                    </div>

                    <div>
                      <strong>3. Space separated:</strong>
                      <code className="block bg-white p-2 rounded mt-1">
                        username1 password1<br/>
                        user@email.com mypassword
                      </code>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Dữ liệu phức tạp:</h4>
                  <code className="text-sm text-blue-800 block bg-white p-2 rounded">
                    user1|pass1|2fa_code|cookie_data<br/>
                    user2|pass2|backup_codes|session<br/>
                    email@domain.com|password|additional_info
                  </code>
                  <p className="text-sm text-blue-700 mt-2">
                    Toàn bộ dòng sẽ được lưu vào account_data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">⚠️ Lưu ý quan trọng</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>File .txt only</strong><br/>
                      Chỉ hỗ trợ file text (.txt), không hỗ trợ Excel/CSV
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Tối đa 10,000 tài khoản</strong><br/>
                      Chia nhỏ file nếu có quá nhiều tài khoản
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>UTF-8 encoding</strong><br/>
                      Đảm bảo file được save với encoding UTF-8
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Tự động bỏ qua trùng lặp</strong><br/>
                      Username trùng sẽ được bỏ qua, không ghi đè
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">🚀 Tips để upload nhanh:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Chuẩn bị file trước, mỗi dòng 1 tài khoản</li>
                  <li>• Không có dòng trống hoặc header</li>
                  <li>• Test với file nhỏ trước (10-20 tài khoản)</li>
                  <li>• Upload file lớn vào giờ ít traffic</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sample Download */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">💾 File mẫu</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Download file mẫu để xem format chính xác:
            </p>

            <div className="flex space-x-4">
              <Button
                onClick={() => {
                  const sampleContent = `netflix_user1|password123
netflix_user2|mypassword456
spotify_premium1|spotifypass789
youtube_user@gmail.com|ytpassword
steam_account1:steampass123
discord_user1 discordpass456
twitch_streamer|twitchpass|stream_key|follower_data
adobe_user|adobepass|license_key|subscription_info`;

                  const blob = new Blob([sampleContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'sample_accounts.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                variant="outline"
              >
                📁 Download sample_accounts.txt
              </Button>

              <Button
                onClick={() => {
                  const complexSample = `netflix_premium1|netflixpass123|2fa_backup_codes|premium_cookie_data|profile_settings
spotify_family2|spotifypass456|premium_token_here|user_data_json|playlist_info
youtube_creator3|ytpass789|google_auth_token|channel_analytics|monetization_data
steam_library4|steampass000|guard_mobile_auth|inventory_items|friend_list_data
discord_nitro5|discordpass111|nitro_subscription|server_boosts|custom_emojis`;

                  const blob = new Blob([complexSample], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'complex_accounts.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                variant="outline"
              >
                📁 Download complex_accounts.txt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
