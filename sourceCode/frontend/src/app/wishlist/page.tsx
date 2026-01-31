'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistApi, WishlistItem } from '@/lib/api/wishlist';
import { Heart, Trash2, Package, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  const getImageUrl = (url: string) => {
    if (url.startsWith('/')) {
      return `http://localhost:8080/api${url}`;
    }
    return url;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistApi.getWishlist();
      console.log('Wishlist response:', response);
      console.log('Wishlist items:', response.content);
      if (response.content && response.content.length > 0) {
        console.log('First product:', response.content[0].product);
        console.log('Stock quantity:', response.content[0].product?.stockQuantity);
      }
      setWishlist(response.content || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      setRemoving(productId);
      await wishlistApi.remove(productId);
      setWishlist(prev => prev.filter(item => item.product.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemoving(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">รายการโปรด</h1>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {wishlist.length} รายการ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              ยังไม่มีสินค้าในรายการโปรด
            </h2>
            <p className="text-gray-500 mb-6">
              เริ่มเพิ่มสินค้าที่คุณชอบเข้ามาในรายการโปรดกันเถอะ!
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              เลือกซื้อสินค้า
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Product Image */}
                <div
                  className="relative aspect-square cursor-pointer"
                  onClick={() => router.push(`/products/${item.product.id}`)}
                >
                  {item.product.images && item.product.images.length > 0 ? (
                    <Image
                      src={getImageUrl(item.product.images[0].url)}
                      alt={item.product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">ไม่มีรูปภาพ</span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.product.id);
                    }}
                    disabled={removing === item.product.id}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="ลบออกจากรายการโปรด"
                  >
                    {removing === item.product.id ? (
                      <Loader2 className="h-5 w-5 text-red-600 animate-spin" />
                    ) : (
                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    )}
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3
                    className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                    onClick={() => router.push(`/products/${item.product.id}`)}
                  >
                    {item.product.name}
                  </h3>
                  <p className="text-xl font-bold text-blue-600 mb-3">
                    ฿{item.product.price.toLocaleString()}
                  </p>

                  <button
                    onClick={() => router.push(`/products/${item.product.id}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Package className="h-4 w-4" />
                    <span>ดูสินค้า</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
