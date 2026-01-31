'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/contexts/ShopContext';
import {
  ShoppingBag,
  Package,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from 'lucide-react';
import api from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockProducts: number;
  productsTrend?: { direction: 'up' | 'down', value: string };
  ordersTrend?: { direction: 'up' | 'down', value: string };
  revenueTrend?: { direction: 'up' | 'down', value: string };
}

interface RecentOrder {
  id: number;
  orderNumber: string;
  userName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface DailyRevenue {
  date: string;
  revenue: number;
}

interface DailyOrders {
  date: string;
  orders: number;
}

interface RatingDistribution {
  rating: string;
  count: number;
}

export default function SellerDashboard() {
  const router = useRouter();
  const { shop, loading: shopLoading } = useShop();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockProducts: 0,
    productsTrend: { direction: 'up', value: '+0%' },
    ordersTrend: { direction: 'up', value: '+0%' },
    revenueTrend: { direction: 'up', value: '+0%' },
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [dailyOrders, setDailyOrders] = useState<DailyOrders[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopLoading && !shop) {
      router.push('/seller/create-shop');
    } else if (!shopLoading && shop) {
      fetchDashboardData();
    }
  }, [shop, shopLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch products
      const productsRes = await api.get(`/products?shopId=${shop?.id}`);
      const products = productsRes.data;

      // Fetch all orders for the shop
      const ordersRes = await api.get('/orders/seller/my-shop-orders', {
        params: { page: 0, size: 100 } // Get first 100 orders
      });
      const ordersData = ordersRes.data;
      const allOrders = ordersData.content || [];

      // Calculate total revenue from COMPLETED orders ONLY
      const completedOrdersList = allOrders.filter((o: any) => o.status === 'COMPLETED');
      const totalRevenue = completedOrdersList.reduce((sum: number, order: any) => {
        return sum + (order.totalAmount || 0);
      }, 0);

      // Count orders by status
      const pendingOrders = allOrders.filter((o: any) => o.status === 'PENDING').length;
      const completedOrders = completedOrdersList.length;

      // Calculate trends - compare this month vs last month
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Products created this month vs last month (if products have createdAt)
      const thisMonthProducts = products.filter((p: any) => {
        if (!p.createdAt) return false;
        const createdDate = new Date(p.createdAt);
        return createdDate >= thisMonthStart;
      }).length;
      const lastMonthProducts = products.filter((p: any) => {
        if (!p.createdAt) return false;
        const createdDate = new Date(p.createdAt);
        return createdDate >= lastMonthStart && createdDate <= lastMonthEnd;
      }).length;
      const productsChange = lastMonthProducts > 0
        ? ((thisMonthProducts - lastMonthProducts) / lastMonthProducts * 100)
        : (thisMonthProducts > 0 ? 100 : 0);

      // Orders this month vs last month
      const thisMonthOrders = allOrders.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= thisMonthStart;
      }).length;
      const lastMonthOrders = allOrders.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
      }).length;
      const ordersChange = lastMonthOrders > 0
        ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders * 100)
        : (thisMonthOrders > 0 ? 100 : 0);

      // Revenue this month vs last month (from COMPLETED orders)
      const thisMonthRevenue = completedOrdersList.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= thisMonthStart;
      }).reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const lastMonthRevenue = completedOrdersList.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
      }).reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const revenueChange = lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
        : (thisMonthRevenue > 0 ? 100 : 0);

      // Fetch reviews for all shop products to calculate average rating and distribution
      let averageRating = 0;
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      if (products.length > 0) {
        const reviewsRes = await api.get('/reviews/seller/my-shop-reviews', {
          params: { shopId: shop?.id, page: 0, size: 1000 }
        });
        const reviews = reviewsRes.data.content || [];
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
          averageRating = totalRating / reviews.length;

          // Count reviews by rating
          reviews.forEach((review: any) => {
            if (review.rating >= 1 && review.rating <= 5) {
              ratingCounts[review.rating as keyof typeof ratingCounts]++;
            }
          });
        }
      }

      // Convert rating counts to array for chart
      const ratingData: RatingDistribution[] = [
        { rating: '1 ดาว', count: ratingCounts[1] },
        { rating: '2 ดาว', count: ratingCounts[2] },
        { rating: '3 ดาว', count: ratingCounts[3] },
        { rating: '4 ดาว', count: ratingCounts[4] },
        { rating: '5 ดาว', count: ratingCounts[5] },
      ];
      setRatingDistribution(ratingData);

      // Calculate stats
      setStats({
        totalProducts: products.length || 0,
        totalOrders: allOrders.length,
        totalRevenue: totalRevenue,
        averageRating: averageRating,
        pendingOrders: pendingOrders,
        completedOrders: completedOrders,
        lowStockProducts: products.filter((p: any) => p.stockQuantity < 10).length,
        productsTrend: {
          direction: productsChange >= 0 ? 'up' : 'down',
          value: `${productsChange >= 0 ? '+' : ''}${productsChange.toFixed(1)}%`
        },
        ordersTrend: {
          direction: ordersChange >= 0 ? 'up' : 'down',
          value: `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(1)}%`
        },
        revenueTrend: {
          direction: revenueChange >= 0 ? 'up' : 'down',
          value: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`
        }
      });

      // Set recent orders (first 3)
      const recent = allOrders.slice(0, 3).map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        userName: order.userName,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      }));
      setRecentOrders(recent);

      // Calculate daily revenue and orders for the last 30 days
      const revenueMap = new Map<string, number>();
      const ordersMap = new Map<string, number>();
      const today = new Date();

      // Initialize last 30 days with 0 revenue and 0 orders
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
        revenueMap.set(dateStr, 0);
        ordersMap.set(dateStr, 0);
      }

      // Sum revenue by date from COMPLETED orders only
      completedOrdersList.forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        const dateStr = orderDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
        if (revenueMap.has(dateStr)) {
          revenueMap.set(dateStr, (revenueMap.get(dateStr) || 0) + order.totalAmount);
        }
      });

      // Count all orders by date (including all statuses)
      allOrders.forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        const dateStr = orderDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
        if (ordersMap.has(dateStr)) {
          ordersMap.set(dateStr, (ordersMap.get(dateStr) || 0) + 1);
        }
      });

      // Convert to arrays for charts
      const revenueData: DailyRevenue[] = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
        date,
        revenue
      }));
      setDailyRevenue(revenueData);

      const dailyOrdersData: DailyOrders[] = Array.from(ordersMap.entries()).map(([date, orders]) => ({
        date,
        orders
      }));
      setDailyOrders(dailyOrdersData);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (shopLoading || loading || !shop) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue'
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600',
      yellow: 'from-yellow-500 to-yellow-600',
    }[color] || 'from-blue-500 to-blue-600';

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:scale-105">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          </div>
          <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
        {trend && trendValue && (
          <div className="flex items-center gap-1 text-sm">
            {trend === 'up' ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
              {trendValue}
            </span>
            <span className="text-gray-500">จากเดือนที่แล้ว</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
          แดชบอร์ด
        </h1>
        <p className="text-white/80 text-sm">
          ภาพรวมข้อมูลร้านค้าของคุณ {shop.name}
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8 pb-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="สินค้าทั้งหมด"
              value={stats.totalProducts}
              icon={Package}
              color="blue"
              trend={stats.productsTrend?.direction}
              trendValue={stats.productsTrend?.value}
            />
            <StatCard
              title="คำสั่งซื้อ"
              value={stats.totalOrders}
              icon={ShoppingBag}
              color="green"
              trend={stats.ordersTrend?.direction}
              trendValue={stats.ordersTrend?.value}
            />
            <StatCard
              title="รายได้ทั้งหมด"
              value={`฿${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="purple"
              trend={stats.revenueTrend?.direction}
              trendValue={stats.revenueTrend?.value}
            />
            <StatCard
              title="คะแนนเฉลี่ย"
              value={stats.averageRating.toFixed(1)}
              icon={Star}
              color="yellow"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">รายได้ 30 วันย้อนหลัง</h2>
                <p className="text-sm text-gray-500 mt-1">รายได้จากคำสั่งซื้อที่เสร็จสิ้นแล้ว</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: number) => [`฿${value.toLocaleString()}`, 'รายได้']}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Orders Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">คำสั่งซื้อ 30 วันย้อนหลัง</h2>
                <p className="text-sm text-gray-500 mt-1">จำนวนคำสั่งซื้อทั้งหมดแต่ละวัน</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyOrders}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: number) => [`${value} คำสั่งซื้อ`, 'จำนวน']}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rating Distribution Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">การกระจายคะแนนรีวิว</h2>
              <p className="text-sm text-gray-500 mt-1">จำนวนรีวิวแต่ละระดับคะแนน</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="rating"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => [`${value} รีวิว`, 'จำนวน']}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="count"
                  fill="#f59e0b"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">รอดำเนินการ</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">สินค้าใกล้หมด</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">คำสั่งซื้อล่าสุด</h2>
                <button
                  onClick={() => router.push('/seller/order')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  ดูทั้งหมด
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>ยังไม่มีคำสั่งซื้อ</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 cursor-pointer"
                      onClick={() => router.push('/seller/order')}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{order.userName}</p>
                        <p className="text-sm text-gray-500">
                          {order.orderNumber} · {new Date(order.createdAt).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">฿{order.totalAmount.toLocaleString()}</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'PROCESSING'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'SHIPPED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status === 'COMPLETED' ? 'เสร็จสิ้น' :
                           order.status === 'PENDING' ? 'รอดำเนินการ' :
                           order.status === 'PROCESSING' ? 'กำลังเตรียม' :
                           order.status === 'SHIPPED' ? 'กำลังจัดส่ง' : order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">รายการด่วน</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/seller/products')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  จัดการสินค้า
                </button>

                <button
                  onClick={() => router.push('/seller/order')}
                  className="w-full px-4 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-5 w-5" />
                  ดูคำสั่งซื้อ
                </button>

                <button
                  onClick={() => router.push('/seller/reviews')}
                  className="w-full px-4 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Star className="h-5 w-5" />
                  รีวิวสินค้า
                </button>

                <button
                  onClick={() => router.push('/seller/shop')}
                  className="w-full px-4 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Eye className="h-5 w-5" />
                  จัดการร้านค้า
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
