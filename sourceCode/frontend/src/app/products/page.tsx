'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, Star, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';

interface Product {
  id: number;
  name: string;
  description?: string;
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
  categoryId?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch products when category changes
  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      api.get(`/categories/${categoryId}`)
        .then(res => setSelectedCategory(res.data))
        .catch(err => console.error('Failed to fetch category:', err));
    } else {
      setSelectedCategory(null);
    }
  }, [categoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (categoryId) {
        params.categoryId = categoryId;
      }
      const response = await api.get('/products/search', { params });
      // Filter only active products with stock
      const activeProducts = (response.data.content || response.data).filter((p: Product) => {
        const stock = p.hasVariants ? (p.totalStock || 0) : p.stockQuantity;
        return stock > 0;
      });
      setProducts(activeProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for search query (instant feedback)
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProductPrice = (product: Product) => {
    if (product.hasVariants && product.minPrice !== product.maxPrice) {
      return `฿${product.minPrice?.toLocaleString()} - ฿${product.maxPrice?.toLocaleString()}`;
    }
    return `฿${product.price.toLocaleString()}`;
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">สินค้าทั้งหมด</h1>
          <p className="text-gray-600">ค้นพบสินค้าคุณภาพจากร้านค้าต่างๆ</p>
        </div>

        {/* Selected Category Indicator */}
        {selectedCategory && (
          <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <span className="text-gray-600">หมวดหมู่:</span>
            <span className="font-semibold text-blue-700">{selectedCategory.name}</span>
            <button
              onClick={() => router.push('/products')}
              className="ml-auto text-sm bg-white text-blue-600 px-3 py-1 rounded-lg border border-blue-300 hover:bg-blue-100 transition-colors"
            >
              ดูสินค้าทั้งหมด
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบสินค้า</h3>
            <p className="text-gray-600">
              {searchQuery ? 'ไม่พบสินค้าที่ตรงกับการค้นหา' : 'ยังไม่มีสินค้าในระบบ'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const discount = getDiscount(product);
              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
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
                        {product.ratingAvg?.toFixed(1) || '0.0'} ({product.ratingCount || 0})
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
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const discount = getDiscount(product);
              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer p-4 flex gap-4"
                >
                  {/* Image */}
                  <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                    {discount && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        -{discount}%
                      </div>
                    )}
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-blue-600">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">
                        {product.ratingAvg?.toFixed(1) || '0.0'} ({product.ratingCount || 0} รีวิว)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {getProductPrice(product)}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-lg text-gray-400 line-through">
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
    </div>
  );
}
