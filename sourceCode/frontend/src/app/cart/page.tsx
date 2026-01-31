'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  Package,
  Loader2,
} from 'lucide-react';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  unitPrice: number;      // Changed from price
  quantity: number;
  stock: number;
  variantId?: number;
  variantOptions?: Record<string, string>;
  shopId: number;
  shopName: string;
}

interface GroupedCart {
  shopId: number;
  shopName: string;
  items: CartItem[];
  subtotal: number;
}

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      // Map the API response to CartItem format
      const items = response.data.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        stock: item.stock || 0,
        variantId: item.variantId,
        variantOptions: item.variantOptions,
        shopId: item.shopId,
        shopName: item.shopName || 'ร้านค้า',
      })) || [];
      setCartItems(items);
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
      setError('ไม่สามารถโหลดตะกร้าสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    if (item.stock && newQuantity > item.stock) {
      setError(`สินค้าคงเหลือเพียง ${item.stock} ชิ้น`);
      return;
    }

    try {
      setUpdating(itemId);
      setError('');
      await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });

      setCartItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
      );
    } catch (err: any) {
      console.error('Failed to update quantity:', err);
      setError(err.response?.data?.message || 'ไม่สามารถอัปเดตจำนวนสินค้าได้');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setUpdating(itemId);
      setError('');
      await api.delete(`/cart/items/${itemId}`);
      setCartItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err: any) {
      console.error('Failed to remove item:', err);
      setError('ไม่สามารถลบสินค้าได้');
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!confirm('คุณต้องการลบสินค้าทั้งหมดในตะกร้าหรือไม่?')) return;

    try {
      setLoading(true);
      await api.delete('/cart');
      setCartItems([]);
    } catch (err: any) {
      console.error('Failed to clear cart:', err);
      setError('ไม่สามารถล้างตะกร้าสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  // Group items by shop
  const groupedCart: GroupedCart[] = cartItems.reduce((acc, item) => {
    const existingShop = acc.find(g => g.shopId === item.shopId);
    const itemSubtotal = item.unitPrice * item.quantity;

    if (existingShop) {
      existingShop.items.push(item);
      existingShop.subtotal += itemSubtotal;
    } else {
      acc.push({
        shopId: item.shopId,
        shopName: item.shopName,
        items: [item],
        subtotal: itemSubtotal,
      });
    }

    return acc;
  }, [] as GroupedCart[]);

  const totalAmount = groupedCart.reduce((sum, shop) => sum + shop.subtotal, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดตะกร้าสินค้า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                ตะกร้าสินค้า
              </h1>
              {cartItems.length > 0 && (
                <p className="text-gray-600 mt-1">
                  {totalItems} รายการ จาก {groupedCart.length} ร้านค้า
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                ตะกร้าสินค้าว่างเปล่า
              </h2>
              <p className="text-gray-600 mb-8">
                คุณยังไม่มีสินค้าในตะกร้า เริ่มช็อปปิ้งเลย!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
              >
                <ShoppingBag className="h-5 w-5" />
                เลือกซื้อสินค้า
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {groupedCart.map((shop) => (
                <div key={shop.shopId} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Shop Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                    <Link
                      href={`/shops/${shop.shopId}`}
                      className="flex items-center gap-3 hover:opacity-80 transition"
                    >
                      <Package className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">{shop.shopName}</span>
                    </Link>
                  </div>

                  {/* Shop Items */}
                  <div className="divide-y divide-gray-200">
                    {shop.items.map((item) => (
                      <div key={item.id} className="p-6">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <Link
                            href={`/products/${item.productId}`}
                            className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition"
                          >
                            {item.productImage ? (
                              <Image
                                src={item.productImage}
                                alt={item.productName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </Link>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.productId}`}
                              className="font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-2"
                            >
                              {item.productName}
                            </Link>

                            {/* Variant Info */}
                            {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(item.variantOptions).map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                  >
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Stock Warning */}
                            {item.stock < 10 && (
                              <p className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                เหลือเพียง {item.stock} ชิ้น
                              </p>
                            )}

                            {/* Price and Controls */}
                            <div className="mt-4 flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-bold text-blue-600">
                                  ฿{item.unitPrice.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  รวม: ฿{(item.unitPrice * item.quantity).toLocaleString()}
                                </p>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1 || updating === item.id}
                                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-l-lg"
                                  >
                                    <Minus className="h-4 w-4 text-gray-600" />
                                  </button>

                                  <span className="w-12 text-center font-semibold text-gray-900">
                                    {updating === item.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                    ) : (
                                      item.quantity
                                    )}
                                  </span>

                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={item.quantity >= item.stock || updating === item.id}
                                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-r-lg"
                                  >
                                    <Plus className="h-4 w-4 text-gray-600" />
                                  </button>
                                </div>

                                {/* Delete Button */}
                                <button
                                  onClick={() => removeItem(item.id)}
                                  disabled={updating === item.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                  title="ลบสินค้า"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shop Subtotal */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">ยอดรวมร้านนี้:</span>
                      <span className="text-xl font-bold text-gray-900">
                        ฿{shop.subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="w-full py-3 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 font-medium transition flex items-center justify-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                ล้างตะกร้าสินค้า
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20">
                <h2 className="text-xl font-bold text-gray-900 mb-6">สรุปคำสั่งซื้อ</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>ยอดรวมสินค้า ({totalItems} ชิ้น)</span>
                    <span className="font-semibold">฿{totalAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>ค่าจัดส่ง</span>
                    <span className="text-green-600 font-semibold">ฟรี</span>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-900">ยอดรวมทั้งหมด</span>
                    <span className="font-bold text-blue-600 text-2xl">
                      ฿{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
                >
                  ดำเนินการชำระเงิน
                </button>

                {/* Continue Shopping */}
                <Link
                  href="/products"
                  className="block text-center mt-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition"
                >
                  เลือกซื้อสินค้าต่อ
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600">✓</span>
                    </div>
                    <span>ชำระเงินปลอดภัย</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600">✓</span>
                    </div>
                    <span>จัดส่งฟรีเมื่อซื้อครบ ฿500</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600">✓</span>
                    </div>
                    <span>รับประกันคืนเงิน 30 วัน</span>
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
