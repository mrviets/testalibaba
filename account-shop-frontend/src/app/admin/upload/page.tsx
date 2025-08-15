'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Product } from '@/types';
import { productsAPI, adminAPI } from '@/lib/api';
import { 
  DocumentArrowUpIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminUploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [textData, setTextData] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<string[]>([]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.txt')) {
      toast.error('Chỉ hỗ trợ file .txt');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      toast.error('File quá lớn. Tối đa 10MB');
      return;
    }

    setFile(selectedFile);
    
    // Preview file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim());
      setPreviewData(lines.slice(0, 10)); // Show first 10 lines
    };
    reader.readAsText(selectedFile);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setTextData(content);
    
    // Preview text data
    const lines = content.split('\n').filter(line => line.trim());
    setPreviewData(lines.slice(0, 10));
  };

  const parseAccountData = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const accounts = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Support multiple formats
      let username = '';
      let password = '';
      let accountData = trimmedLine;

      // Format 1: username|password
      if (trimmedLine.includes('|')) {
        const parts = trimmedLine.split('|');
        username = parts[0]?.trim() || '';
        password = parts[1]?.trim() || '';
      }
      // Format 2: username:password
      else if (trimmedLine.includes(':')) {
        const parts = trimmedLine.split(':');
        username = parts[0]?.trim() || '';
        password = parts[1]?.trim() || '';
      }
      // Format 3: username password (space separated)
      else if (trimmedLine.includes(' ')) {
        const parts = trimmedLine.split(' ');
        username = parts[0]?.trim() || '';
        password = parts[1]?.trim() || '';
      }
      // Format 4: email format
      else if (trimmedLine.includes('@')) {
        username = trimmedLine;
        password = 'default123'; // Default password
      }

      if (username) {
        accounts.push({
          username,
          password,
          account_data: accountData,
          status: 'available'
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

    let content = '';
    if (uploadMethod === 'file') {
      if (!file) {
        toast.error('Vui lòng chọn file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        content = e.target?.result as string;
        await processUpload(content);
      };
      reader.readAsText(file);
    } else {
      if (!textData.trim()) {
        toast.error('Vui lòng nhập dữ liệu tài khoản');
        return;
      }
      await processUpload(textData);
    }
  };

  const processUpload = async (content: string) => {
    setLoading(true);

    try {
      const accounts = parseAccountData(content);
      
      if (accounts.length === 0) {
        toast.error('Không tìm thấy tài khoản hợp lệ trong dữ liệu');
        return;
      }

      if (accounts.length > 10000) {
        toast.error('Tối đa 10,000 tài khoản mỗi lần upload');
        return;
      }

      // Call API to upload accounts
      const response = await adminAPI.bulkUploadAccounts({
        product_id: selectedProduct,
        accounts: accounts
      });

      const result = response.data;
      
      toast.success(result.message || `Upload thành công ${accounts.length} tài khoản!`);
      
      // Reset form
      setFile(null);
      setTextData('');
      setPreviewData([]);
      setSelectedProduct(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Có lỗi xảy ra khi upload tài khoản');
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
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">📤 Upload tài khoản hàng loạt</h1>
          <p className="text-green-100 text-lg">
            Upload file hoặc paste dữ liệu tài khoản để thêm vào kho
          </p>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📋 Thông tin upload</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn sản phẩm:
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
                      {product.name} (Có sẵn: {product.available_count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức upload:
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="file"
                      checked={uploadMethod === 'file'}
                      onChange={(e) => setUploadMethod(e.target.value as 'file' | 'text')}
                      className="mr-2"
                    />
                    📁 Upload file .txt
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="text"
                      checked={uploadMethod === 'text'}
                      onChange={(e) => setUploadMethod(e.target.value as 'file' | 'text')}
                      className="mr-2"
                    />
                    📝 Paste text
                  </label>
                </div>
              </div>

              {/* File Upload */}
              {uploadMethod === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn file tài khoản (.txt):
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {file && (
                    <p className="text-sm text-green-600 mt-2">
                      ✅ Đã chọn: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              )}

              {/* Text Input */}
              {uploadMethod === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste dữ liệu tài khoản:
                  </label>
                  <textarea
                    value={textData}
                    onChange={handleTextChange}
                    placeholder="Paste dữ liệu tài khoản vào đây..."
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                </div>
              )}

              {/* Preview */}
              {previewData.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    👀 Preview (10 dòng đầu):
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {previewData.join('\n')}
                    </pre>
                    {previewData.length >= 10 && (
                      <p className="text-xs text-gray-500 mt-2">
                        ... và nhiều dòng khác
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                loading={loading}
                disabled={!selectedProduct || (uploadMethod === 'file' ? !file : !textData.trim())}
                className="w-full"
              >
                <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                Upload tài khoản
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Format Instructions */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📖 Hướng dẫn format dữ liệu</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">✅ Các format được hỗ trợ:</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h5 className="font-medium text-blue-900">Format 1: Pipe separated</h5>
                    <code className="text-sm text-blue-800 block mt-1">
                      username1|password1<br/>
                      username2|password2<br/>
                      user@email.com|mypassword
                    </code>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <h5 className="font-medium text-green-900">Format 2: Colon separated</h5>
                    <code className="text-sm text-green-800 block mt-1">
                      username1:password1<br/>
                      username2:password2<br/>
                      user@email.com:mypassword
                    </code>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h5 className="font-medium text-purple-900">Format 3: Space separated</h5>
                    <code className="text-sm text-purple-800 block mt-1">
                      username1 password1<br/>
                      username2 password2<br/>
                      user@email.com mypassword
                    </code>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <h5 className="font-medium text-yellow-900">Format 4: Complex data</h5>
                    <code className="text-sm text-yellow-800 block mt-1">
                      user1|pass1|2fa_code|cookie_data<br/>
                      user2|pass2|backup_codes|session_token<br/>
                      email@domain.com|password|additional_info
                    </code>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">📝 Lưu ý quan trọng:</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">
                        <strong>Mỗi dòng = 1 tài khoản</strong><br/>
                        Không để dòng trống giữa các tài khoản
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
                        <strong>Encoding UTF-8</strong><br/>
                        Đảm bảo file được save với encoding UTF-8
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">
                        <strong>Dữ liệu gốc được lưu</strong><br/>
                        Toàn bộ dòng sẽ được lưu vào account_data
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-red-800 mb-1">Tránh các lỗi thường gặp:</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Không có dòng header trong file</li>
                        <li>• Không có ký tự đặc biệt lạ</li>
                        <li>• Không có tab, chỉ dùng space hoặc |:</li>
                        <li>• Kiểm tra preview trước khi upload</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sample Data */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">💡 Dữ liệu mẫu</h3>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Ví dụ file accounts.txt:</h4>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
{`netflix_user1|password123|2fa_backup_codes|premium_cookie_data
netflix_user2|mypassword456|auth_token_here|session_data
spotify_premium1|spotifypass789|premium_token|user_data_json
youtube_user@gmail.com|ytpassword|google_auth_token|channel_info
steam_account1:steampass123:guard_codes:inventory_data
discord_user1 discordpass456 nitro_token user_settings`}
              </pre>
            </div>

            <div className="mt-4 flex space-x-4">
              <Button
                onClick={() => {
                  const sampleData = `netflix_user1|password123|2fa_backup_codes|premium_cookie_data
netflix_user2|mypassword456|auth_token_here|session_data
spotify_premium1|spotifypass789|premium_token|user_data_json
youtube_user@gmail.com|ytpassword|google_auth_token|channel_info
steam_account1:steampass123:guard_codes:inventory_data
discord_user1 discordpass456 nitro_token user_settings`;
                  setTextData(sampleData);
                  setUploadMethod('text');
                  handleTextChange({ target: { value: sampleData } } as any);
                }}
                variant="outline"
                size="sm"
              >
                📋 Copy dữ liệu mẫu
              </Button>

              <Button
                onClick={() => {
                  const blob = new Blob([`netflix_user1|password123
netflix_user2|mypassword456
spotify_premium1|spotifypass789
youtube_user@gmail.com|ytpassword
steam_account1:steampass123
discord_user1 discordpass456`], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'sample_accounts.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                variant="outline"
                size="sm"
              >
                💾 Download file mẫu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
