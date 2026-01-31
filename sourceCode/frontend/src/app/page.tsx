'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  ShoppingBag,
  TrendingUp,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Package,
  Store,
  Heart,
  User,
  Clock,
  Truck
} from 'lucide-react';
import api from '@/lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
  comparePrice?: number;
  images?: { url: string }[];
  hasVariants: boolean;
  minPrice?: number;
  maxPrice?: number;
  ratingAvg?: number;
  ratingCount?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);

  // Hero Banners
  const banners = [
    {
      title: 'ลดสูงสุด 50%',
      subtitle: 'ช้อปเลย! สินค้าคุณภาพ ราคาพิเศษ',
      bg: 'from-blue-600 to-purple-600',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop'
    },
    {
      title: 'สินค้าใหม่ล่าสุด',
      subtitle: 'เทรนด์ใหม่มาแล้ว! อัพเดททุกวัน',
      bg: 'from-pink-600 to-red-600',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop'
    },
    {
      title: 'จัดส่งฟรี',
      subtitle: 'ทุกคำสั่งซื้อเกิน ฿500',
      bg: 'from-green-600 to-teal-600',
      image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=400&fit=crop'
    }
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Auto-rotate banners
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.slice(0, 8)); // Get first 8 products
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories', {
        params: { size: 8 }
      });
      setCategories(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Icon and color mapping for categories
  const categoryStyles: Record<string, { icon: string; bg: string }> = {
    'เสื้อผ้า': { icon: '👔', bg: 'from-pink-500 to-rose-500' },
    'อิเล็กทรอนิกส์': { icon: '💻', bg: 'from-blue-500 to-cyan-500' },
    'ของใช้ในบ้าน': { icon: '🏠', bg: 'from-purple-500 to-indigo-500' },
    'ความงาม': { icon: '💄', bg: 'from-pink-500 to-fuchsia-500' },
    'กีฬา': { icon: '⚽', bg: 'from-green-500 to-emerald-500' },
    'หนังสือ': { icon: '📚', bg: 'from-amber-500 to-orange-500' },
    'ของเล่น': { icon: '🧸', bg: 'from-red-500 to-pink-500' },
    'default': { icon: '🎁', bg: 'from-gray-500 to-slate-500' }
  };

  const getCategoryStyle = (name: string) => {
    return categoryStyles[name] || categoryStyles['default'];
  };

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const url = product.images[0].url;
      // Add API base URL if the URL is relative
      if (url.startsWith('/')) {
        return `http://localhost:8080/api${url}`;
      }
      return url;
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Carousel */}
      <div className="relative h-[400px] overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentBanner ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.bg}`}>
              <div className="absolute inset-0 opacity-20 bg-cover bg-center"
                   style={{ backgroundImage: `url(${banner.image})` }}></div>
            </div>
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <div className="text-white max-w-2xl">
                <h1 className="text-5xl font-bold mb-4">{banner.title}</h1>
                <p className="text-xl mb-8">{banner.subtitle}</p>
                <button
                  onClick={() => router.push('/products')}
                  className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center gap-2"
                >
                  ช้อปเลย <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Banner Navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentBanner ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Arrow Navigation */}
        <button
          onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full px-6 py-4 pr-32 border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-2.5 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition flex items-center gap-2"
            >
              <Search className="h-5 w-5" />
              ค้นหา
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Quick Access - Only shown when authenticated */}
        {isAuthenticated && (
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/orders')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 hover:from-blue-700 hover:to-blue-800 transition shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-6 w-6" />
                      <h3 className="text-lg font-bold">คำสั่งซื้อของฉัน</h3>
                    </div>
                    <p className="text-blue-100 text-sm">ดูประวัติและติดตามสถานะ</p>
                  </div>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition" />
                </div>
              </button>

              <button
                onClick={() => router.push('/profile')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-6 hover:from-purple-700 hover:to-purple-800 transition shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-6 w-6" />
                      <h3 className="text-lg font-bold">โปรไฟล์</h3>
                    </div>
                    <p className="text-purple-100 text-sm">จัดการข้อมูลส่วนตัว</p>
                  </div>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition" />
                </div>
              </button>

              <button
                onClick={() => router.push('/cart')}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 hover:from-green-700 hover:to-green-800 transition shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-6 w-6" />
                      <h3 className="text-lg font-bold">ตะกร้าสินค้า</h3>
                    </div>
                    <p className="text-green-100 text-sm">สินค้าที่รอชำระเงิน</p>
                  </div>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition" />
                </div>
              </button>
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => {
              const style = getCategoryStyle(category.name);
              return (
                <button
                  key={category.id}
                  onClick={() => router.push(`/products?categoryId=${category.id}`)}
                  className="group"
                >
                  <div className={`aspect-square bg-gradient-to-br ${style.bg} rounded-2xl p-4 flex items-center justify-center text-5xl group-hover:scale-105 transition shadow-lg`}>
                    {style.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-2 text-center">{category.name}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Flash Sale */}
        <section className="mb-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Flash Sale</h2>
                <p className="text-orange-100">ลดสูงสุด 50% เฉพาะวันนี้!</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/products')}
              className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition"
            >
              ดูทั้งหมด
            </button>
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">สินค้าแนะนำ</h2>
            <button
              onClick={() => router.push('/products')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              ดูทั้งหมด <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => {
                const discount = getDiscount(product);
                return (
                  <div
                    key={product.id}
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer group"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-t-xl">
                      {discount && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          -{discount}%
                        </div>
                      )}
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {product.ratingAvg?.toFixed(1) || '0.0'} ({product.ratingCount || 0})
                        </span>
                      </div>
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
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">จัดส่งรวดเร็ว</h3>
            <p className="text-gray-600 text-sm">ส่งถึงมือคุณภายใน 1-3 วัน</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">สินค้าหลากหลาย</h3>
            <p className="text-gray-600 text-sm">เลือกซื้อได้จากหลายร้านค้า</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">บริการเยี่ยม</h3>
            <p className="text-gray-600 text-sm">ดูแลทุกการซื้อของคุณ</p>
          </div>
        </section>

        {/* Seller CTA */}
        {!isAuthenticated && (
          <section className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
            <Store className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">เริ่มต้นขายกับเรา</h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              สมัครเป็นผู้ขายและเริ่มต้นสร้างรายได้ออนไลน์ได้ทันที ไม่มีค่าใช้จ่าย
            </p>
            <button
              onClick={() => router.push('/register')}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              สมัครเลย
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
