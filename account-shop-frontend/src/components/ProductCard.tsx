import { useState } from 'react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { 
  ShoppingCartIcon, 
  EyeIcon,
  BookOpenIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
  onPurchase: (productId: number, quantity: number) => void;
  onViewTutorial?: (product: Product) => void;
  loading?: boolean;
}

export default function ProductCard({ product, onPurchase, onViewTutorial, loading }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(quantity + delta, product.available_count || 1000));
    setQuantity(newQuantity);
  };

  const handlePurchase = () => {
    onPurchase(product.id, quantity);
  };

  const getProductImage = () => {
    if (product.image_url) return product.image_url;
    if (product.image) return product.image;
    
    // Default images based on product type
    if (product.product_type === 'tool') {
      return 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop&crop=center';
    }
    
    // Default images for different services
    const name = product.name.toLowerCase();
    if (name.includes('netflix')) {
      return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop&crop=center';
    } else if (name.includes('spotify')) {
      return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center';
    } else if (name.includes('youtube')) {
      return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop&crop=center';
    } else if (name.includes('facebook')) {
      return 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=300&fit=crop&crop=center';
    } else if (name.includes('instagram')) {
      return 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=300&fit=crop&crop=center';
    }
    
    return 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=center';
  };

  const getProductTypeIcon = () => {
    if (product.product_type === 'tool') {
      return '🛠️';
    }
    return '🎯';
  };

  const getAvailabilityStatus = () => {
    if (product.available_count === 0) {
      return { text: 'Hết hàng', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (product.available_count < 10) {
      return { text: 'Sắp hết', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    }
    return { text: 'Còn hàng', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const status = getAvailabilityStatus();

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getProductImage()}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Product Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
            {getProductTypeIcon()} {product.product_type === 'tool' ? 'Tool' : 'Account'}
          </span>
        </div>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span className={`${status.bgColor} ${status.color} px-2 py-1 rounded-full text-xs font-medium`}>
            {status.text}
          </span>
        </div>

        {/* Tutorial Badge for Tools */}
        {product.product_type === 'tool' && product.tutorial_content && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <BookOpenIcon className="w-3 h-3 mr-1" />
              Có hướng dẫn
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Title & Description */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(product.price)}
            </span>
            <span className="text-sm text-gray-500 ml-1">/ tài khoản</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Có sẵn</div>
            <div className="font-semibold text-gray-900">
              {product.available_count} tài khoản
            </div>
          </div>
        </div>

        {/* Quantity Selector */}
        {product.available_count > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng:
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="font-medium text-gray-900 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (product.available_count || 1000)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Total Price */}
        {quantity > 1 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Tổng cộng:</span>
              <span className="font-bold text-blue-900">
                {formatCurrency(product.price * quantity)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {product.available_count > 0 ? (
            <Button
              onClick={handlePurchase}
              loading={loading}
              className="w-full"
              size="lg"
            >
              <ShoppingCartIcon className="w-4 h-4 mr-2" />
              Mua ngay
            </Button>
          ) : (
            <Button
              disabled
              className="w-full"
              size="lg"
              variant="secondary"
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              Hết hàng
            </Button>
          )}

          {/* Tutorial Button for Tools */}
          {product.product_type === 'tool' && product.tutorial_content && onViewTutorial && (
            <Button
              onClick={() => onViewTutorial(product)}
              variant="outline"
              className="w-full"
            >
              <BookOpenIcon className="w-4 h-4 mr-2" />
              Xem hướng dẫn
            </Button>
          )}

          {/* Details Toggle */}
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
          </Button>
        </div>

        {/* Extended Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Loại sản phẩm:</span>
                <span className="font-medium">
                  {product.product_type === 'tool' ? 'Phần mềm/Tool' : 'Tài khoản'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng số:</span>
                <span className="font-medium">{product.total_count || product.available_count}</span>
              </div>
              {product.tutorial_video_url && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Video hướng dẫn:</span>
                  <span className="text-blue-600 flex items-center">
                    <PlayIcon className="w-3 h-3 mr-1" />
                    Có sẵn
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
