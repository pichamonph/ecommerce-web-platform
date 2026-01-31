'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  ChevronRight,
  Loader2,
  Search,
} from 'lucide-react';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrders = async () => {
    try {
      console.log('🔄 Starting to fetch orders...');
      setLoading(true);
      setError(''); // Clear any previous errors

      const response = await api.get('/orders');
      console.log('📦 Full API Response:', response);
      console.log('📦 Response data type:', typeof response.data);
      console.log('📦 Response data:', response.data);

      // Handle Spring Page format
      if (response.data && typeof response.data === 'object') {
        const ordersList = response.data.content || response.data || [];
        console.log('📊 Orders list:', ordersList);
        console.log('📈 Number of orders:', Array.isArray(ordersList) ? ordersList.length : 0);

        if (Array.isArray(ordersList)) {
          console.log('✅ Setting', ordersList.length, 'orders to state');
          setOrders(ordersList);
        } else {
          console.error('❌ Orders list is not an array:', ordersList);
          setOrders([]);
        }
      } else {
        console.error('❌ Invalid response format:', response.data);
        setOrders([]);
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch orders:', err);
      console.error('📛 Error response:', err.response?.data);
      console.error('📛 Error status:', err.response?.status);
      setError('ไม่สามารถโหลดประวัติคำสั่งซื้อได้');
      setOrders([]);
    } finally {
      setLoading(false);
      console.log('✔️ Fetch completed. Orders in state:', orders.length);
    }
  };

  const getStatusConfig = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
      PENDING: {
        label: 'รอดำเนินการ',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: Clock,
      },
      PAYMENT_PENDING: {
        label: 'รอชำระเงิน',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100',
        icon: Clock,
      },
      PAID: {
        label: 'ชำระแล้ว',
        color: 'text-cyan-700',
        bgColor: 'bg-cyan-100',
        icon: CheckCircle,
      },
      CONFIRMED: {
        label: 'ยืนยันแล้ว',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: CheckCircle,
      },
      PROCESSING: {
        label: 'กำลังเตรียมสินค้า',
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-100',
        icon: Package,
      },
      READY_TO_SHIP: {
        label: 'พร้อมจัดส่ง',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        icon: Package,
      },
      SHIPPED: {
        label: 'กำลังจัดส่ง',
        color: 'text-violet-700',
        bgColor: 'bg-violet-100',
        icon: Truck,
      },
      OUT_FOR_DELIVERY: {
        label: 'อยู่ระหว่างจัดส่ง',
        color: 'text-fuchsia-700',
        bgColor: 'bg-fuchsia-100',
        icon: Truck,
      },
      DELIVERED: {
        label: 'จัดส่งสำเร็จ',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-100',
        icon: CheckCircle,
      },
      COMPLETED: {
        label: 'สำเร็จ',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: CheckCircle,
      },
      CANCELLED: {
        label: 'ยกเลิก',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: AlertCircle,
      },
      REFUNDED: {
        label: 'คืนเงินแล้ว',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: AlertCircle,
      },
    };

    return statusConfig[status] || statusConfig.PENDING;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  const filterButtons = [
    { value: 'all', label: 'ทั้งหมด', count: orders.length },
    { value: 'PENDING', label: 'รอยืนยัน', count: orders.filter(o => o.status === 'PENDING').length },
    { value: 'CONFIRMED', label: 'ยืนยันแล้ว', count: orders.filter(o => o.status === 'CONFIRMED').length },
    { value: 'PROCESSING', label: 'กำลังเตรียม', count: orders.filter(o => o.status === 'PROCESSING').length },
    { value: 'SHIPPED', label: 'จัดส่งแล้ว', count: orders.filter(o => o.status === 'SHIPPED').length },
    { value: 'COMPLETED', label: 'สำเร็จ', count: orders.filter(o => o.status === 'COMPLETED').length },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดคำสั่งซื้อ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            คำสั่งซื้อของฉัน
          </h1>
          <p className="text-gray-600">ประวัติการสั่งซื้อทั้งหมด {orders.length} รายการ</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === btn.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {btn.label}
                {btn.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filter === btn.value ? 'bg-blue-700' : 'bg-gray-300'
                  }`}>
                    {btn.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {filter === 'all' ? 'ยังไม่มีคำสั่งซื้อ' : 'ไม่พบคำสั่งซื้อในหมวดหมู่นี้'}
              </h2>
              <p className="text-gray-600 mb-8">
                {filter === 'all'
                  ? 'เริ่มช็อปปิ้งและสั่งซื้อสินค้าเลย!'
                  : 'ลองเลือกหมวดหมู่อื่นดูสิ'}
              </p>
              <button
                onClick={() => router.push('/products')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
              >
                <ShoppingBag className="h-5 w-5" />
                เลือกซื้อสินค้า
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                          </p>
                          <p className="font-semibold text-gray-900">
                            คำสั่งซื้อ #{order.orderNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          {statusConfig.label}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-2">
                          {order.items.length} รายการ
                        </p>
                        <div className="space-y-1">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <p key={idx} className="text-sm text-gray-700">
                              • {item.productName} × {item.quantity}
                            </p>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-sm text-gray-500">
                              และอีก {order.items.length - 3} รายการ...
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-6">
                        <p className="text-sm text-gray-500 mb-1">ยอดรวม</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ฿{order.totalAmount.toLocaleString()}
                        </p>
                      </div>
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
