'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/contexts/ShopContext';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Filter,
  Search,
  Eye,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

interface OrderItem {
  id: number;
  productId: number;
  shopId: number;
  productName: string;
  productSku?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  status?: string;
  variantId?: number;
  variantSku?: string;
  variantTitle?: string;
  variantOptions?: Record<string, string>;
}

interface Payment {
  id: number;
  paymentNumber: string;
  paymentMethod: string;
  paymentMethodDisplayName?: string;
  status: string;
  statusDisplayName?: string;
  amount: number;
  currency: string;
  gatewayTransactionId?: string;
  failureReason?: string;
  createdAt: string;
  paidAt?: string;
  failedAt?: string;
  isCompleted?: boolean;
}

interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddressJson?: string;
  billingAddressJson?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  payments?: Payment[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { shop, loading: shopLoading } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // For stats calculation

  useEffect(() => {
    if (!shopLoading && shop) {
      fetchOrders();
    }
  }, [shop, shopLoading, statusFilter, page]);

  // Fetch all orders once for stats
  useEffect(() => {
    if (!shopLoading && shop && allOrders.length === 0) {
      fetchAllOrders();
    }
  }, [shop, shopLoading]);

  const fetchAllOrders = async () => {
    try {
      // Fetch all orders for stats (no pagination, large size)
      const response = await api.get('/orders/seller/my-shop-orders', {
        params: { page: 0, size: 10000 }
      });
      const data = response.data;
      setAllOrders(data.content || []);
    } catch (error: any) {
      console.error('Failed to fetch all orders for stats:', error);
      // If fails, use current orders as fallback
      setAllOrders(orders);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      // Build query parameters
      const params: any = {
        page,
        size: 20,
      };

      // Add status filter if not 'ALL'
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const response = await api.get('/orders/seller/my-shop-orders', { params });
      const data = response.data;

      // Handle Spring Boot Page response
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      const errorData = error.response?.data;

      // Handle error message - it might be a string or an object
      let errorMessage = 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้';
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }

      if (error.response?.status === 400 && errorMessage.includes('does not have a shop')) {
        setError('คุณยังไม่มีร้านค้า กรุณาสร้างร้านค้าก่อน');
        router.push('/seller/create-shop');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Define allowed status transitions for SELLER (payment-related statuses are auto-managed by system)
  const getAllowedTransitions = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      // Payment statuses are managed automatically by the payment system
      PENDING: ['CONFIRMED', 'CANCELLED', 'ON_HOLD'],  // Removed PAYMENT_PENDING, PAID (auto-managed)
      PAYMENT_PENDING: ['CANCELLED'],  // Can only cancel, PAID/FAILED auto-managed
      PAID: ['CONFIRMED', 'CANCELLED'],  // Can confirm or cancel, REFUNDED requires payment system
      PAYMENT_FAILED: ['CANCELLED'],  // Can only cancel

      // Order fulfillment statuses (seller-controlled)
      CONFIRMED: ['PROCESSING', 'READY_TO_SHIP', 'CANCELLED'],
      PROCESSING: ['READY_TO_SHIP', 'ON_HOLD', 'CANCELLED'],
      READY_TO_SHIP: ['SHIPPED', 'ON_HOLD', 'CANCELLED'],
      SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED', 'DISPUTED'],
      DELIVERED: ['COMPLETED', 'RETURNED', 'DISPUTED'],
      ON_HOLD: ['PENDING', 'CONFIRMED', 'PROCESSING', 'CANCELLED'],
      COMPLETED: ['DISPUTED', 'RETURNED'],
      CANCELLED: [],
      REFUNDED: [],
      RETURNED: [],
      DISPUTED: ['COMPLETED', 'CANCELLED'],
    };
    return transitions[currentStatus] || [];
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, null, {
        params: { status: newStatus }
      });
      setSuccess('อัปเดตสถานะสำเร็จ');
      fetchOrders();
      fetchAllOrders(); // Refresh stats
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      const errorData = error.response?.data;
      let errorMessage = 'ไม่สามารถอัปเดตสถานะได้';

      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }

      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().includes(searchQuery);
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      // Order Creation Phase
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'รอดำเนินการ' },

      // Payment Phase
      PAYMENT_PENDING: { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'รอชำระเงิน' },
      PAID: { color: 'bg-cyan-100 text-cyan-800', icon: CheckCircle, label: 'ชำระแล้ว' },
      PAYMENT_FAILED: { color: 'bg-rose-100 text-rose-800', icon: XCircle, label: 'ชำระไม่สำเร็จ' },

      // Processing Phase
      CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'ยืนยันแล้ว' },
      PROCESSING: { color: 'bg-indigo-100 text-indigo-800', icon: Package, label: 'กำลังเตรียมสินค้า' },

      // Fulfillment Phase
      READY_TO_SHIP: { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'พร้อมจัดส่ง' },
      SHIPPED: { color: 'bg-violet-100 text-violet-800', icon: Truck, label: 'จัดส่งแล้ว' },
      OUT_FOR_DELIVERY: { color: 'bg-fuchsia-100 text-fuchsia-800', icon: Truck, label: 'กำลังจัดส่ง' },
      DELIVERED: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'จัดส่งสำเร็จ' },

      // Completion Phase
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'เสร็จสิ้น' },

      // Problem/Cancel Phase
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'ยกเลิก' },
      REFUNDED: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'คืนเงินแล้ว' },
      RETURNED: { color: 'bg-slate-100 text-slate-800', icon: XCircle, label: 'ส่งคืนแล้ว' },

      // Special Cases
      ON_HOLD: { color: 'bg-amber-100 text-amber-800', icon: Clock, label: 'ระงับ' },
      DISPUTED: { color: 'bg-orange-200 text-orange-900', icon: AlertCircle, label: 'ร้องเรียน' },
    };
    const config = configs[status as keyof typeof configs] || configs.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  };

  if (shopLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!shop) {
    router.push('/seller/create-shop');
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">คำสั่งซื้อ</h1>
        <p className="text-white/80 text-sm">จัดการคำสั่งซื้อของร้านค้าของคุณ</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6 pb-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Stats Cards - Following correct order flow */}
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map((status) => {
              // Use allOrders for accurate count across all pages
              const count = status === 'ALL' ? allOrders.length : allOrders.filter((o) => o.status === status).length;
              const labels: Record<string, string> = {
                ALL: 'ทั้งหมด',
                PENDING: 'รอยืนยัน',
                CONFIRMED: 'ยืนยันแล้ว',
                PROCESSING: 'เตรียมสินค้า',
                READY_TO_SHIP: 'พร้อมส่ง',
                SHIPPED: 'ส่งแล้ว',
                OUT_FOR_DELIVERY: 'กำลังส่ง',
                DELIVERED: 'ส่งสำเร็จ',
                COMPLETED: 'เสร็จสิ้น',
                CANCELLED: 'ยกเลิก',
              };

              return (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(0);
                  }}
                  className={`p-2.5 rounded-xl border-2 transition-all ${
                    statusFilter === status
                      ? 'bg-white border-blue-500 shadow-lg'
                      : 'bg-white/80 border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <p className="text-xs text-gray-600 mb-0.5 line-clamp-1">{labels[status]}</p>
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ค้นหาคำสั่งซื้อด้วยชื่อลูกค้า หรือหมายเลขคำสั่งซื้อ..."
              />
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่มีคำสั่งซื้อ</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'ALL' ? 'ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข' : 'ยังไม่มีคำสั่งซื้อในร้านค้า'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{order.orderNumber}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{order.userName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(order.createdAt).toLocaleString('th-TH')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">฿{order.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{order.items?.length || 0} รายการ</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">รายการสินค้า</h4>
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-start justify-between text-sm">
                            <div className="flex-1">
                              <span className="text-gray-900 font-medium">
                                {item.productName}
                              </span>
                              {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Object.entries(item.variantOptions).map(([key, value]) => (
                                    <span key={key} className="text-xs bg-white border border-gray-300 text-gray-600 px-1.5 py-0.5 rounded">
                                      {key}: {value}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <span className="text-gray-500 text-xs block mt-1">
                                x {item.quantity}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900 ml-2">฿{item.totalPrice.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        ดูรายละเอียด
                      </button>

                      {order.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            ยืนยันคำสั่งซื้อ
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      )}

                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'PROCESSING')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          เริ่มเตรียมสินค้า
                        </button>
                      )}

                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'READY_TO_SHIP')}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                          พร้อมจัดส่ง
                        </button>
                      )}

                      {order.status === 'READY_TO_SHIP' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          จัดส่งสินค้า
                        </button>
                      )}

                      {order.status === 'SHIPPED' && (
                        <div className="text-sm text-gray-600 italic">
                          รอลูกค้ายืนยันรับสินค้า
                        </div>
                      )}

                      {order.status === 'DELIVERED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          ✓ ปิดงาน (เสร็จสิ้น)
                        </button>
                      )}

                      {/* Quick Action Menu for other statuses */}
                      {!['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status) && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                        >
                          อัพเดทสถานะ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">รายละเอียดคำสั่งซื้อ {selectedOrder.orderNumber}</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-3">อัพเดทสถานะคำสั่งซื้อ</label>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-2">สถานะปัจจุบัน:</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>

                {(() => {
                  const allowedStatuses = getAllowedTransitions(selectedOrder.status);
                  const statusLabels: Record<string, string> = {
                    PENDING: '🔵 รอดำเนินการ',
                    PAYMENT_PENDING: '💳 รอชำระเงิน',
                    PAID: '💳 ชำระแล้ว',
                    PAYMENT_FAILED: '💳 ชำระไม่สำเร็จ',
                    CONFIRMED: '📦 ยืนยันแล้ว',
                    PROCESSING: '📦 กำลังเตรียมสินค้า',
                    READY_TO_SHIP: '🚚 พร้อมจัดส่ง',
                    SHIPPED: '🚚 จัดส่งแล้ว',
                    OUT_FOR_DELIVERY: '🚚 กำลังจัดส่ง',
                    DELIVERED: '🚚 จัดส่งสำเร็จ',
                    COMPLETED: '✅ เสร็จสิ้น',
                    CANCELLED: '❌ ยกเลิก',
                    REFUNDED: '❌ คืนเงินแล้ว',
                    RETURNED: '❌ ส่งคืนแล้ว',
                    ON_HOLD: '⚠️ ระงับ',
                    DISPUTED: '⚠️ ร้องเรียน',
                  };

                  if (allowedStatuses.length === 0) {
                    return (
                      <div className="bg-gray-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600">ไม่สามารถเปลี่ยนสถานะได้ (สถานะสุดท้าย)</p>
                      </div>
                    );
                  }

                  return (
                    <>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">เลือกสถานะถัดไป:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {allowedStatuses.map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                if (confirm(`ต้องการเปลี่ยนสถานะเป็น "${statusLabels[status]}" ใช่หรือไม่?`)) {
                                  handleUpdateOrderStatus(selectedOrder.id, status);
                                  setSelectedOrder(null);
                                }
                              }}
                              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left text-sm font-medium text-gray-900"
                            >
                              {statusLabels[status]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 italic">
                        💡 แสดงเฉพาะสถานะที่สามารถเปลี่ยนได้จากสถานะปัจจุบัน
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">ข้อมูลลูกค้า</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{selectedOrder.userName}</span>
                  </div>
                  {selectedOrder.userEmail && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📧</span>
                      <span className="text-gray-700">{selectedOrder.userEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    ข้อมูลการชำระเงิน
                  </h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-blue-700">อัปเดตอัตโนมัติ</span>
                  </div>
                </div>
                {selectedOrder.payments && selectedOrder.payments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.payments.map((payment) => {
                      const paymentStatusConfig: Record<string, { color: string; icon: any; label: string }> = {
                        PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'รอชำระเงิน' },
                        PROCESSING: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, label: 'กำลังดำเนินการ' },
                        COMPLETED: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'ชำระเงินสำเร็จ' },
                        FAILED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'ชำระเงินไม่สำเร็จ' },
                        CANCELLED: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle, label: 'ยกเลิก' },
                        REFUNDED: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: AlertCircle, label: 'คืนเงินแล้ว' },
                      };
                      const statusConfig = paymentStatusConfig[payment.status] || paymentStatusConfig.PENDING;
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div key={payment.id} className={`border-2 rounded-lg p-4 ${statusConfig.color}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-5 w-5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold">{statusConfig.label}</p>
                                <p className="text-xs opacity-75 mt-0.5">
                                  {payment.paymentNumber || `Payment #${payment.id}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">฿{payment.amount.toLocaleString()}</p>
                              <p className="text-xs opacity-75">{payment.currency || 'THB'}</p>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="opacity-75">วิธีชำระเงิน:</span>
                              <span className="font-medium">
                                {payment.paymentMethodDisplayName || payment.paymentMethod}
                              </span>
                            </div>

                            {payment.paidAt && (
                              <div className="flex items-center justify-between">
                                <span className="opacity-75">วันที่ชำระ:</span>
                                <span className="font-medium">
                                  {new Date(payment.paidAt).toLocaleString('th-TH')}
                                </span>
                              </div>
                            )}

                            {payment.failedAt && (
                              <div className="flex items-center justify-between">
                                <span className="opacity-75">วันที่ล้มเหลว:</span>
                                <span className="font-medium">
                                  {new Date(payment.failedAt).toLocaleString('th-TH')}
                                </span>
                              </div>
                            )}

                            {payment.gatewayTransactionId && (
                              <div className="flex items-start justify-between">
                                <span className="opacity-75">Transaction ID:</span>
                                <span className="font-mono text-xs break-all text-right max-w-[200px]">
                                  {payment.gatewayTransactionId}
                                </span>
                              </div>
                            )}

                            {payment.failureReason && (
                              <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                                <p className="text-xs opacity-75 mb-1">เหตุผลที่ล้มเหลว:</p>
                                <p className="text-sm font-medium">{payment.failureReason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">ยังไม่มีข้อมูลการชำระเงิน</p>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddressJson && (() => {
                try {
                  const address = JSON.parse(selectedOrder.shippingAddressJson);
                  return (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-600" />
                        ที่อยู่จัดส่ง
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <p className="font-medium text-gray-900">{address.fullName}</p>
                        {address.phone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{address.phone}</span>
                          </div>
                        )}
                        {address.email && (
                          <p className="text-gray-700">📧 {address.email}</p>
                        )}
                        <div className="pt-2 border-t border-gray-200 text-gray-700 leading-relaxed">
                          <p>{address.addressLine1}</p>
                          {address.addressLine2 && <p>{address.addressLine2}</p>}
                          <p>
                            {address.city} {address.province} {address.postalCode}
                          </p>
                          <p>{address.country || 'ประเทศไทย'}</p>
                        </div>
                      </div>
                    </div>
                  );
                } catch (e) {
                  return (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">ที่อยู่จัดส่ง</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">{selectedOrder.shippingAddressJson}</p>
                      </div>
                    </div>
                  );
                }
              })()}

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">รายการสินค้า</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-start justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.variantOptions).map(([key, value]) => (
                              <span key={key} className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-0.5 rounded">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          ฿{item.unitPrice.toLocaleString()} × {item.quantity} ชิ้น
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 ml-4">฿{item.totalPrice.toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">ยอดรวมสินค้า</span>
                      <span className="text-gray-900">฿{selectedOrder.subtotal.toLocaleString()}</span>
                    </div>
                    {selectedOrder.shippingFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">ค่าจัดส่ง</span>
                        <span className="text-gray-900">฿{selectedOrder.shippingFee.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrder.taxAmount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">ภาษี</span>
                        <span className="text-gray-900">฿{selectedOrder.taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-300">
                      <span>รวมทั้งหมด</span>
                      <span className="text-blue-600">฿{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">หมายเหตุ</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
