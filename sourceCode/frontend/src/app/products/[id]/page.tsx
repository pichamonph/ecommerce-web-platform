'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Truck,
  Shield,
  Package,
  Store,
  RotateCcw,
  Award,
  Clock,
  MapPin,
  MessageSquare,
  User,
  Calendar,
  MessageCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useChatStore } from '@/store/chatStore';
import WishlistButton from '@/components/WishlistButton';

interface Review {
  id: number;
  userId: number;
  userName?: string;
  userProfileImage?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  shopReply?: string;
  repliedAt?: string;
}

interface ProductVariant {
  id: number;
  sku: string;
  variantOptions: Record<string, string>;
  price: number;
  comparePrice?: number;
  stockQuantity: number;
  imageUrls?: string[];
  displayName: string;
  available: boolean;
}

interface Shop {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  rating?: number;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stockQuantity: number;
  images?: { id: number; url: string; altText?: string }[];
  shopId: number;
  hasVariants: boolean;
  variants?: ProductVariant[];
  totalStock?: number;
  minPrice?: number;
  maxPrice?: number;
  ratingAvg?: number;
  ratingCount?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { user } = useAuth();
  const { createOrGetRoom } = useChatStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (activeTab === 'reviews' && reviews.length === 0) {
      fetchReviews();
    }
  }, [activeTab]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await api.get('/reviews', {
        params: {
          productId: productId,
          page: 0,
          size: 50
        }
      });
      setReviews(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);

      // Fetch shop data
      if (response.data.shopId) {
        try {
          const shopResponse = await api.get(`/shops/${response.data.shopId}`);
          setShop(shopResponse.data);
        } catch (shopError) {
          console.error('Failed to fetch shop:', shopError);
        }
      }

      // Fetch related products (same shop or random)
      try {
        const productsResponse = await api.get('/products');
        const related = productsResponse.data
          .filter((p: Product) => p.id !== response.data.id)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (relatedError) {
        console.error('Failed to fetch related products:', relatedError);
      }

      // Set first variant as selected if has variants
      if (response.data.hasVariants && response.data.variants?.length > 0) {
        const firstVariant = response.data.variants[0];
        setSelectedVariant(firstVariant);
        setSelectedOptions(firstVariant.variantOptions);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (attributeName: string, value: string) => {
    const newOptions = { ...selectedOptions, [attributeName]: value };
    setSelectedOptions(newOptions);

    // Find matching variant
    const matchingVariant = product?.variants?.find(v => {
      return Object.keys(newOptions).every(
        key => v.variantOptions[key] === newOptions[key]
      );
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  };

  const getAvailableOptions = (attributeName: string): string[] => {
    if (!product?.variants) return [];

    const options = new Set<string>();
    product.variants.forEach(v => {
      if (v.variantOptions[attributeName]) {
        options.add(v.variantOptions[attributeName]);
      }
    });

    return Array.from(options);
  };

  // Check if option is available based on current selections (Amazon-style)
  const isOptionAvailable = (attributeName: string, optionValue: string): boolean => {
    if (!product?.variants) return false;

    // Build hypothetical selection, excluding the current attribute
    // (so we can always switch within the same attribute group)
    const otherSelections: Record<string, string> = {};
    Object.keys(selectedOptions).forEach(key => {
      if (key !== attributeName) {
        otherSelections[key] = selectedOptions[key];
      }
    });

    // If no other selections, all options are available
    if (Object.keys(otherSelections).length === 0) {
      return product.variants.some(v => v.variantOptions[attributeName] === optionValue);
    }

    // Check if any variant has this option AND matches other selections
    return product.variants.some(variant => {
      // Must match the option we're checking
      if (variant.variantOptions[attributeName] !== optionValue) return false;

      // Must match all other selected attributes
      return Object.keys(otherSelections).every(key => {
        if (!variant.variantOptions[key]) return true;
        return variant.variantOptions[key] === otherSelections[key];
      });
    });
  };

  // Get stock count for a specific option
  const getOptionStock = (attributeName: string, optionValue: string): number => {
    if (!product?.variants) return 0;

    const hypotheticalSelection = { ...selectedOptions, [attributeName]: optionValue };

    const matchingVariants = product.variants.filter(variant => {
      return Object.keys(hypotheticalSelection).every(key => {
        if (!variant.variantOptions[key]) return true;
        return variant.variantOptions[key] === hypotheticalSelection[key];
      });
    });

    return matchingVariants.reduce((sum, v) => sum + v.stockQuantity, 0);
  };


  const getAttributeNames = (): string[] => {
    if (!product?.variants || product.variants.length === 0) return [];

    const attributes = new Set<string>();
    product.variants.forEach(v => {
      Object.keys(v.variantOptions).forEach(key => attributes.add(key));
    });

    return Array.from(attributes);
  };

  const getCurrentPrice = (): number => {
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product?.price || 0;
  };

  const getCurrentComparePrice = (): number | undefined => {
    if (selectedVariant) {
      return selectedVariant.comparePrice;
    }
    return product?.comparePrice;
  };

  const getCurrentStock = (): number => {
    if (selectedVariant) {
      return selectedVariant.stockQuantity;
    }
    return product?.stockQuantity || 0;
  };

  const getDiscount = (): number | null => {
    const price = getCurrentPrice();
    const comparePrice = getCurrentComparePrice();
    if (comparePrice && comparePrice > price) {
      return Math.round(((comparePrice - price) / comparePrice) * 100);
    }
    return null;
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('/')) {
      return `http://localhost:8080/api${url}`;
    }
    return url;
  };

  const images = product?.images && product.images.length > 0
    ? product.images.map(img => ({ ...img, url: getImageUrl(img.url) }))
    : [{ id: 0, url: 'https://via.placeholder.com/600x600?text=No+Image', altText: 'No image' }];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if product has variants but no variant selected
    if (product.hasVariants && !selectedVariant) {
      alert('กรุณาเลือกตัวเลือกสินค้า');
      return;
    }

    // Check stock
    const currentStock = getCurrentStock();
    if (currentStock === 0) {
      alert('สินค้าหมด');
      return;
    }

    if (quantity > currentStock) {
      alert(`สินค้าคงเหลือเพียง ${currentStock} ชิ้น`);
      return;
    }

    try {
      const requestBody: any = {
        productId: product.id,
        quantity: quantity,
      };

      // Add variantId if variant is selected
      if (selectedVariant) {
        requestBody.variantId = selectedVariant.id;
      }

      await api.post('/cart/items', requestBody);

      alert('เพิ่มสินค้าลงตะกร้าแล้ว! 🛒');

      // Optional: Navigate to cart
      // router.push('/cart');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      if (error.response?.status === 401) {
        alert('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
        router.push('/login');
      } else {
        alert(error.response?.data?.message || 'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้');
      }
    }
  };

  const handleChatWithShop = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!product?.shopId) return;

    try {
      // Create or get chat room with shop (no orderId for general chat)
      const room = await createOrGetRoom(user.id, product.shopId);

      // Navigate to chat page with room ID
      router.push(`/chat?roomId=${room.id}`);
    } catch (error) {
      console.error('Failed to create chat room:', error);
      alert('ไม่สามารถเปิดแชทได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบสินค้า</h2>
          <p className="text-gray-600 mb-6">{error || 'สินค้าที่คุณค้นหาไม่มีในระบบ'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  const currentStock = getCurrentStock();
  const discount = getDiscount();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-blue-600">
            หน้าหลัก
          </button>
          <ChevronRight className="h-4 w-4" />
          <button onClick={() => router.push('/products')} className="hover:text-blue-600">
            สินค้าทั้งหมด
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Shop Info Banner */}
        {shop && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                {shop.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Store className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                {shop.description && (
                  <p className="text-sm text-gray-600 line-clamp-1">{shop.description}</p>
                )}
                {shop.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{shop.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push(`/shops/${shop.id}`)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                <Store className="h-4 w-4" />
                ดูร้านค้า
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200">
              {discount && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discount}%
                </div>
              )}

              <img
                src={images[currentImageIndex].url}
                alt={images[currentImageIndex].altText || product.name}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || `${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.ratingAvg || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.ratingAvg?.toFixed(1) || '0.0'} ({product.ratingCount || 0} รีวิว)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-blue-600">
                    ฿{getCurrentPrice().toLocaleString()}
                  </span>
                  {getCurrentComparePrice() && getCurrentComparePrice()! > getCurrentPrice() && (
                    <span className="text-xl text-gray-400 line-through">
                      ฿{getCurrentComparePrice()!.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Variants Selection - Amazon Style Smart Filtering */}
            {product.hasVariants && (
              <div className="space-y-5">
                {getAttributeNames().map(attrName => {
                  const attributeLabel = attrName.charAt(0).toUpperCase() + attrName.slice(1);

                  return (
                    <div key={attrName} className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <label className="block text-sm font-semibold text-gray-900">
                          {attributeLabel}
                        </label>
                        {selectedOptions[attrName] && (
                          <span className="text-sm text-gray-600">
                            เลือก: <span className="font-medium text-blue-600">{selectedOptions[attrName]}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {getAvailableOptions(attrName).map(option => {
                          const isSelected = selectedOptions[attrName] === option;
                          const isAvailable = isOptionAvailable(attrName, option);
                          const stock = getOptionStock(attrName, option);

                          return (
                            <button
                              key={option}
                              onClick={() => isAvailable && handleOptionChange(attrName, option)}
                              disabled={!isAvailable}
                              className={`
                                group relative px-5 py-3 border-2 rounded-lg font-medium transition-all
                                ${isSelected
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                  : isAvailable
                                  ? 'border-gray-300 bg-white text-gray-900 hover:border-blue-400 hover:bg-blue-50'
                                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                }
                              `}
                            >
                              <span className={!isAvailable ? 'line-through' : ''}>
                                {option}
                              </span>

                              {/* Selected checkmark */}
                              {isSelected && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              )}

                              {/* Stock indicator on hover (only if available) */}
                              {isAvailable && !isSelected && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  {stock > 0 ? `${stock} ชิ้น` : 'หมดสต็อก'}
                                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                </div>
                              )}

                              {/* Unavailable message on hover */}
                              {!isAvailable && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  ไม่มีตัวเลือกนี้
                                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Availability hint */}
                      {selectedOptions[attrName] && (
                        <p className="text-xs text-gray-500 italic">
                          💡 ตัวเลือกที่ขีดฆ่าคือตัวเลือกที่ไม่เข้ากับตัวเลือกอื่นที่คุณเลือก
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Selected variant summary */}
                {selectedVariant && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">เลือกแล้ว</p>
                          <p className="text-lg font-bold text-gray-900">{selectedVariant.displayName}</p>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-bold text-blue-600">
                              ฿{selectedVariant.price.toLocaleString()}
                            </span>
                            {selectedVariant.comparePrice && selectedVariant.comparePrice > selectedVariant.price && (
                              <span className="text-sm text-gray-400 line-through">
                                ฿{selectedVariant.comparePrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No variant selected warning */}
                {!selectedVariant && Object.keys(selectedOptions).length === getAttributeNames().length && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">ไม่มีตัวเลือกนี้</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        ไม่พบสินค้าที่ตรงกับตัวเลือกที่เลือก กรุณาเลือกตัวเลือกอื่น
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {currentStock > 0 ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    มีสินค้าในสต็อก ({currentStock} ชิ้น)
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">สินค้าหมด</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            {currentStock > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวน
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={currentStock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(currentStock, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  เพิ่มลงตะกร้า
                </button>
                <div className="flex items-center">
                  <WishlistButton productId={product.id} size="lg" />
                </div>
                <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={handleChatWithShop}
                className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                แชทกับร้านค้า
              </button>
            </div>

            {/* Trust Badges */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>จัดส่งฟรี เมื่อซื้อ ฿500+</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>รับประกัน 30 วัน</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                  <RotateCcw className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <span>คืนสินค้าได้ภายใน 7 วัน</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <span>ของแท้ 100%</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">จัดส่งถึง</p>
                  <p className="text-sm text-gray-600">กรุงเทพและปริมณฑล</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">ระยะเวลาจัดส่ง</p>
                  <p className="text-sm text-gray-600">1-3 วันทำการ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 px-1 font-medium transition-colors relative ${
                  activeTab === 'description'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                รายละเอียดสินค้า
                {activeTab === 'description' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 px-1 font-medium transition-colors relative ${
                  activeTab === 'reviews'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                รีวิวสินค้า ({product.ratingCount || 0})
                {activeTab === 'reviews' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-4 px-1 font-medium transition-colors relative ${
                  activeTab === 'shipping'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                การจัดส่ง
                {activeTab === 'shipping' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-2xl p-8 border border-gray-200 border-t-0">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold text-gray-900 mb-4">รายละเอียดสินค้า</h3>
                <div className="text-gray-600 leading-relaxed">
                  {product.description ? (
                    <p>{product.description}</p>
                  ) : (
                    <p className="text-gray-400 italic">ไม่มีรายละเอียดสินค้า</p>
                  )}
                </div>

                {/* Product Specs */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">ข้อมูลจำเพาะ</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">ชื่อสินค้า</span>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                    {selectedVariant && (
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">SKU</span>
                        <span className="font-medium text-gray-900">{selectedVariant.sku}</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">สถานะสินค้า</span>
                      <span className="font-medium text-gray-900">
                        {currentStock > 0 ? 'มีสินค้า' : 'หมดสต็อก'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">ร้านค้า</span>
                      <span className="font-medium text-gray-900">{shop?.name || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">รีวิวจากผู้ซื้อ</h3>

                {/* Rating Summary */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 mb-2">
                        {product.ratingAvg?.toFixed(1) || '0.0'}
                      </div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(product.ratingAvg || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{product.ratingCount || 0} รีวิว</p>
                    </div>
                    <div className="flex-1">
                      {reviews.length > 0 ? (
                        <div className="space-y-1">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = reviews.filter(r => r.rating === rating).length;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                              <div key={rating} className="flex items-center gap-2 text-sm">
                                <span className="w-12 text-gray-600">{rating} ⭐</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-yellow-400"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="w-12 text-right text-gray-600">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">
                          ยังไม่มีรีวิวสำหรับสินค้านี้ เป็นคนแรกที่รีวิวสินค้านี้!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">กำลังโหลดรีวิว...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                        {/* Reviewer Info */}
                        <div className="flex items-start gap-4 mb-3">
                          {review.userProfileImage ? (
                            <img
                              src={review.userProfileImage}
                              alt={review.userName || 'User'}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {review.userName?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">{review.userName || 'ผู้ใช้'}</p>
                              <span className="text-gray-400">·</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(review.createdAt).toLocaleDateString('th-TH')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Review Comment */}
                        {review.comment && (
                          <p className="text-gray-700 leading-relaxed mb-3 ml-16">
                            {review.comment}
                          </p>
                        )}

                        {/* Shop Reply */}
                        {review.shopReply && (
                          <div className="ml-16 mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {shop?.name?.[0] || 'S'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-semibold text-blue-900">{shop?.name || 'ร้านค้า'}</p>
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                    ตอบกลับจากร้านค้า
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{review.shopReply}</p>
                                {review.repliedAt && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    <Calendar className="h-3 w-3 inline mr-1" />
                                    {new Date(review.repliedAt).toLocaleDateString('th-TH')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
                    <p className="text-sm text-gray-500">
                      ซื้อสินค้าและเป็นคนแรกที่รีวิว!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">ข้อมูลการจัดส่ง</h3>

                <div className="space-y-6">
                  {/* Delivery Options */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      ตัวเลือกการจัดส่ง
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <Package className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">จัดส่งมาตรฐาน</p>
                          <p className="text-sm text-gray-600">1-3 วันทำการ • ฟรี เมื่อซื้อครบ ฿500</p>
                          <p className="text-sm text-gray-500 mt-1">ค่าจัดส่ง ฿50 (สำหรับยอดซื้อต่ำกว่า ฿500)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <Truck className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">จัดส่งด่วน</p>
                          <p className="text-sm text-gray-600">ภายในวันเดียวกัน • ฿120</p>
                          <p className="text-sm text-gray-500 mt-1">สำหรับพื้นที่กรุงเทพและปริมณฑล</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Return Policy */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <RotateCcw className="h-5 w-5 text-green-600" />
                      นโยบายการคืนสินค้า
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>คืนสินค้าได้ภายใน 7 วัน หากสินค้าไม่ตรงตามรายละเอียด</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>สินค้าต้องอยู่ในสภาพเดิม ไม่ผ่านการใช้งาน</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>มีบรรจุภัณฑ์และอุปกรณ์ครบถ้วน</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Warranty */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      การรับประกัน
                    </h4>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        สินค้านี้ได้รับการรับประกันจากผู้ผลิต 30 วัน
                        สำหรับความเสียหายจากการผลิตหรือข้อบกพร่องของสินค้า
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">สินค้าที่เกี่ยวข้อง</h2>
              <button
                onClick={() => router.push('/products')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                ดูทั้งหมด
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const relatedDiscount = relatedProduct.comparePrice && relatedProduct.comparePrice > relatedProduct.price
                  ? Math.round(((relatedProduct.comparePrice - relatedProduct.price) / relatedProduct.comparePrice) * 100)
                  : null;

                return (
                  <div
                    key={relatedProduct.id}
                    onClick={() => router.push(`/products/${relatedProduct.id}`)}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden border border-gray-100"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden">
                      {relatedDiscount && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          -{relatedDiscount}%
                        </div>
                      )}
                      <img
                        src={
                          relatedProduct.images && relatedProduct.images.length > 0
                            ? getImageUrl(relatedProduct.images[0].url)
                            : 'https://via.placeholder.com/400x400?text=No+Image'
                        }
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm">
                        {relatedProduct.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">
                          {relatedProduct.ratingAvg?.toFixed(1) || '0.0'}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-blue-600">
                          ฿{relatedProduct.price.toLocaleString()}
                        </span>
                        {relatedProduct.comparePrice && relatedProduct.comparePrice > relatedProduct.price && (
                          <span className="text-xs text-gray-400 line-through">
                            ฿{relatedProduct.comparePrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
