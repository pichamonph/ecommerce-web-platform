'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Store,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  ShoppingBag,
  TrendingUp,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Share2,
  Heart,
  ChevronRight,
  Package
} from 'lucide-react';
import api from '@/lib/api';

interface Shop {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  rating?: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  createdAt?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  comparePrice?: number;
  images?: { id: number; url: string }[];
  hasVariants: boolean;
  minPrice?: number;
  maxPrice?: number;
  totalStock?: number;
  stockQuantity: number;
  ratingAvg?: number;
  ratingCount?: number;
}

export default function ShopProfilePage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchShopData();
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      setLoading(true);

      // Fetch shop info
      const shopResponse = await api.get(`/shops/${shopId}`);
      setShop(shopResponse.data);

      // Fetch shop products
      const productsResponse = await api.get(`/products?shopId=${shopId}`);
      // Filter only products with stock
      const activeProducts = productsResponse.data.filter((p: Product) => {
        const stock = p.hasVariants ? (p.totalStock || 0) : p.stockQuantity;
        return stock > 0;
      });
      setProducts(activeProducts);
    } catch (error) {
      console.error('Failed to fetch shop data:', error);
      setError('ไม่สามารถโหลดข้อมูลร้านค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageUrl = (url: string) => {
    if (url.startsWith('/')) {
      return `http://localhost:8080/api${url}`;
    }
    return url;
  };

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return getImageUrl(product.images[0].url);
    }
    return 'https://via.placeholder.com/400x400?text=No+Image';
  };

  const getProductPrice = (product: Product) => {
    if (product.hasVariants && product.minPrice !== product.maxPrice) {
      return `฿${product.minPrice?.toLocaleString()} - ฿${product.maxPrice?.toLocaleString()}`;
    }
    return `฿${product.price.toLocaleString()}`;
  };

  const getDiscount = (product: Product): number | null => {
    if (product.comparePrice && product.comparePrice > product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบร้านค้า</h2>
          <p className="text-gray-600 mb-6">{error || 'ร้านค้าที่คุณค้นหาไม่มีในระบบ'}</p>
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

  const totalProducts = products.length;
  const avgRating = shop.rating || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Banner */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        {shop.bannerUrl && (
          <img
            src={shop.bannerUrl}
            alt={shop.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Shop Header */}
        <div className="relative -mt-32 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Shop Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {shop.logoUrl ? (
                    <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="h-16 w-16 text-white" />
                  )}
                </div>
              </div>

              {/* Shop Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.name}</h1>
                    {shop.description && (
                      <p className="text-gray-600 mb-3">{shop.description}</p>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">คะแนนร้านค้า</span>
                      </div>
                      <div className="h-4 w-px bg-gray-300"></div>
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold text-gray-900">{totalProducts}</span>
                        <span className="text-gray-500 text-sm">สินค้า</span>
                      </div>
                    </div>

                    {/* Location */}
                    {shop.address && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{shop.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Heart className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Share2 className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                        <p className="text-sm text-gray-600">สินค้าทั้งหมด</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">98%</p>
                        <p className="text-sm text-gray-600">อัตราตอบกลับ</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">คะแนนรีวิว</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'products'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                สินค้าทั้งหมด ({totalProducts})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'about'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                เกี่ยวกับร้าน
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' ? (
          <div className="pb-12">
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาสินค้าในร้านนี้..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'ไม่พบสินค้า' : 'ร้านค้านี้ยังไม่มีสินค้า'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'กรุณากลับมาใหม่ภายหลัง'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const discount = getDiscount(product);
                  return (
                    <div
                      key={product.id}
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all cursor-pointer group overflow-hidden border border-gray-100"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden">
                        {discount && (
                          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                            -{discount}%
                          </div>
                        )}
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {product.ratingAvg?.toFixed(1) || '0.0'}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-blue-600">
                            {getProductPrice(product)}
                          </span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">
                              ฿{product.comparePrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="pb-12">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">เกี่ยวกับร้าน</h2>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">รายละเอียดร้านค้า</h3>
                <p className="text-gray-600 leading-relaxed">
                  {shop.description || 'ร้านค้านี้ยังไม่มีรายละเอียด'}
                </p>
              </div>

              {/* Contact Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลติดต่อ</h3>
                <div className="space-y-3">
                  {shop.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">ที่อยู่</p>
                        <p className="text-gray-600">{shop.address}</p>
                      </div>
                    </div>
                  )}
                  {shop.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">เบอร์โทร</p>
                        <p className="text-gray-600">{shop.phone}</p>
                      </div>
                    </div>
                  )}
                  {shop.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">อีเมล</p>
                        <p className="text-gray-600">{shop.email}</p>
                      </div>
                    </div>
                  )}
                  {shop.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">เว็บไซต์</p>
                        <a
                          href={shop.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {shop.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shop Policies */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">นโยบายร้านค้า</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">คืนสินค้าได้ภายใน 7 วัน</p>
                      <p className="text-sm text-green-700">หากสินค้าไม่ตรงตามที่แจ้งหรือชำรุด</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">จัดส่งฟรี</p>
                      <p className="text-sm text-blue-700">สำหรับคำสั่งซื้อมากกว่า ฿500</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900">ของแท้ 100%</p>
                      <p className="text-sm text-purple-700">รับประกันความถูกต้องของสินค้า</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
