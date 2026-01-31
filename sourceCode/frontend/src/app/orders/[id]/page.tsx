'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import ReviewModal from '@/components/ReviewModal';
import { useChatStore } from '@/store/chatStore';
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  ArrowLeft,
  Loader2,
  ShoppingBag,
  AlertCircle,
  Star,
  MessageCircle,
} from 'lucide-react';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantOptions?: Record<string, string>;
}

interface Payment {
  id: number;
  paymentNumber: string;
  paymentMethod: string;
  paymentMethodDisplayName: string;
  status: string;
  statusDisplayName: string;
  amount: number;
  currency: string;
  gatewayTransactionId?: string;
  createdAt: string;
  paidAt?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  totalAmount: number;
  shippingFee: number;
  taxAmount: number;
  subtotal?: number;
  shippingAddressJson: string;
  billingAddressJson: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  payments?: Payment[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { createOrGetRoom } = useChatStore();

  const orderId = params.id as string;
  const isSuccess = searchParams.get('success') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingProduct, setReviewingProduct] = useState<{ productId: number; productName: string; orderItemId: number } | null>(null);
  const [reviewedOrderItems, setReviewedOrderItems] = useState<Set<number>>(new Set());
  const [shopId, setShopId] = useState<number | null>(null);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchOrder();

      // Auto-refresh order data every 5 seconds if coming from success payment
      let interval: NodeJS.Timeout | null = null;
      if (isSuccess) {
        console.log('🔄 Auto-refreshing order data every 5s to check payment status...');
        interval = setInterval(() => {
          fetchOrder();
        }, 5000);

        // Stop after 1 minute
        setTimeout(() => {
          if (interval) {
            clearInterval(interval);
            console.log('⏹️ Stopped auto-refresh');
          }
        }, 60000);
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isAuthenticated, authLoading, orderId, router, isSuccess]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);

      // Fetch shopId from first product
      if (response.data.items && response.data.items.length > 0) {
        const firstProductId = response.data.items[0].productId;
        try {
          const productRes = await api.get(`/products/${firstProductId}`);
          setShopId(productRes.data.shopId);
        } catch (error) {
          console.error('Failed to fetch product for shopId:', error);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch order:', err);
      setError('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
    } finally {
      setLoading(false);
    }
  };

  const handleChatAboutOrder = async () => {
    if (!user || !shopId || !order) {
      if (!user) {
        router.push('/login');
      }
      return;
    }

    try {
      // Create or get chat room with shop for this specific order
      const room = await createOrGetRoom(user.id, shopId, order.id);

      // Navigate to chat page with room ID
      router.push(`/chat?roomId=${room.id}`);
    } catch (error) {
      console.error('Failed to create chat room:', error);
      alert('ไม่สามารถเปิดแชทได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleConfirmDelivery = async () => {
    console.log('🚀 handleConfirmDelivery called');
    console.log('📦 Order:', order);

    if (!order) {
      console.error('❌ No order found');
      return;
    }

    console.log('✅ Starting delivery confirmation...');
    setConfirmingDelivery(true);
    try {
      const url = `/orders/${order.id}/status?status=DELIVERED`;
      console.log('📡 Sending PUT request to:', url);

      const response = await api.put(url);
      console.log('✅ Response:', response);

      alert('ยืนยันรับสินค้าสำเร็จ! ร้านค้าจะดำเนินการปิดงานต่อไป');
      // Refresh order data
      await fetchOrder();
    } catch (error: any) {
      console.error('❌ Failed to confirm delivery:', error);
      console.error('❌ Error response:', error.response);
      const errorMsg = error.response?.data || 'ไม่สามารถยืนยันการรับสินค้าได้';
      alert(typeof errorMsg === 'string' ? errorMsg : 'ไม่สามารถยืนยันการรับสินค้าได้');
    } finally {
      setConfirmingDelivery(false);
      console.log('🏁 handleConfirmDelivery finished');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      PENDING: { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      PROCESSING: { label: 'กำลังดำเนินการ', color: 'bg-blue-100 text-blue-800', icon: Package },
      SHIPPED: { label: 'กำลังจัดส่ง', color: 'bg-purple-100 text-purple-800', icon: Truck },
      COMPLETED: { label: 'สำเร็จ', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { label: 'ยกเลิก', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${config.color}`}>
        <Icon className="h-5 w-5" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบคำสั่งซื้อ</h2>
          <p className="text-gray-600 mb-6">{error || 'คำสั่งซื้อที่คุณค้นหาไม่มีในระบบ'}</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ดูคำสั่งซื้อทั้งหมด
          </button>
        </div>
      </div>
    );
  }

  const shippingAddress = JSON.parse(order.shippingAddressJson);

  const subtotal = order.subtotal || (order.totalAmount - order.shippingFee - order.taxAmount);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        {isSuccess && (
          <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">สั่งซื้อสำเร็จ!</h1>
            <p className="text-green-50 text-lg">
              ขอบคุณสำหรับการสั่งซื้อ คำสั่งซื้อของคุณกำลังดำเนินการ
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            กลับไปที่คำสั่งซื้อทั้งหมด
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">คำสั่งซื้อ #{order.orderNumber}</h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(order.createdAt)}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                รายการสินค้า ({order.items.length} รายการ)
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(item.variantOptions).map(([key, value]) => (
                            <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span>฿{item.unitPrice.toLocaleString()} × {item.quantity}</span>
                      </div>
                      {/* Review Button - Show only for completed/delivered orders */}
                      {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (
                        <>
                          {reviewedOrderItems.has(item.id) ? (
                            <div className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                              <CheckCircle className="h-4 w-4" />
                              รีวิวแล้ว
                            </div>
                          ) : (
                            <button
                              onClick={() => setReviewingProduct({ productId: item.productId, productName: item.productName, orderItemId: item.id })}
                              className="mt-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition text-sm font-medium shadow-md"
                            >
                              <Star className="h-4 w-4" />
                              รีวิวสินค้า
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ฿{item.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>ยอดรวมสินค้า</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ค่าจัดส่ง</span>
                  {order.shippingFee === 0 ? (
                    <span className="text-green-600">ฟรี</span>
                  ) : (
                    <span>฿{order.shippingFee.toLocaleString()}</span>
                  )}
                </div>
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>ภาษี</span>
                    <span>฿{order.taxAmount.toLocaleString()}</span>
                  </div>
                )}
                <hr className="border-gray-300" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>ยอดรวมทั้งหมด</span>
                  <span className="text-blue-600">฿{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              ที่อยู่จัดส่ง
            </h2>
            <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-900">{shippingAddress.fullName}</p>
              <p>{shippingAddress.addressLine1}</p>
              {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
              <p>
                {shippingAddress.city} {shippingAddress.province} {shippingAddress.postalCode}
              </p>
              <p>{shippingAddress.country}</p>
              <p className="pt-2">โทร: {shippingAddress.phone}</p>
              <p>อีเมล: {shippingAddress.email}</p>
            </div>
          </div>

          {/* Payment & Notes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              การชำระเงิน
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              {order.payments && order.payments.length > 0 ? (
                order.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {payment.paymentMethodDisplayName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {payment.statusDisplayName}
                        {payment.paidAt && ` • ชำระเมื่อ ${formatDate(payment.paidAt)}`}
                      </p>
                      {payment.gatewayTransactionId && (
                        <p className="text-xs text-gray-400 mt-1">
                          Transaction: {payment.gatewayTransactionId}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ฿{payment.amount.toLocaleString()}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                        payment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.statusDisplayName}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <span>เก็บเงินปลายทาง (COD)</span>
                </p>
              )}
            </div>

            {order.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">หมายเหตุ:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Confirm Delivery Button - Show only for SHIPPED status */}
            {order.status === 'SHIPPED' && (
              <button
                onClick={handleConfirmDelivery}
                disabled={confirmingDelivery}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirmingDelivery ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    ยืนยันรับสินค้าแล้ว
                  </>
                )}
              </button>
            )}

            {/* Chat Button */}
            {shopId && (
              <button
                onClick={handleChatAboutOrder}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                แชทเกี่ยวกับออเดอร์นี้
              </button>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/products')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                เลือกซื้อสินค้าต่อ
              </button>
              <button
                onClick={() => router.push('/orders')}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                ดูคำสั่งซื้อทั้งหมด
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewingProduct && (
        <ReviewModal
          productId={reviewingProduct.productId}
          productName={reviewingProduct.productName}
          orderItemId={reviewingProduct.orderItemId}
          onClose={() => setReviewingProduct(null)}
          onSuccess={() => {
            // Mark order item as reviewed (using orderItemId instead of productId)
            setReviewedOrderItems(prev => new Set(prev).add(reviewingProduct.orderItemId));
            alert('ขอบคุณสำหรับรีวิว! ⭐');
          }}
        />
      )}
    </div>
  );
}
