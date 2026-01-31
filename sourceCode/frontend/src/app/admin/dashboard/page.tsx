'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingSellerApplications: number;
  topProducts: Array<{
    productId: number;
    productName: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  topShops: Array<{
    shopId: number;
    shopName: string;
    totalOrders: number;
    totalRevenue: number;
  }>;
  revenueByDate: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get<DashboardStats>('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="ผู้ใช้ทั้งหมด"
            value={stats?.totalUsers || 0}
            color="blue"
          />
          <StatCard
            icon={Store}
            label="ร้านค้า"
            value={stats?.totalSellers || 0}
            color="green"
            badge={stats?.pendingSellerApplications}
            badgeLabel="รออนุมัติ"
          />
          <StatCard
            icon={Package}
            label="สินค้าทั้งหมด"
            value={stats?.totalProducts || 0}
            color="purple"
          />
          <StatCard
            icon={ShoppingCart}
            label="คำสั่งซื้อ"
            value={stats?.totalOrders || 0}
            color="orange"
          />
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">ยอดขายรวม</p>
              <p className="text-4xl font-bold">
                ฿{stats?.totalRevenue.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <DollarSign className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Top Products & Shops */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">สินค้าขายดี</h2>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={stats?.topProducts.slice(0, 5).map(p => ({
                  name: p.productName.length > 10 ? p.productName.substring(0, 10) + '...' : p.productName,
                  ยอดขาย: p.totalRevenue,
                }))}
                margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
                barSize={50}
                barCategoryGap="20%"
              >
                <defs>
                  <linearGradient id="colorProduct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <YAxis
                  tickFormatter={(value) => '฿' + (value / 1000).toFixed(0) + 'K'}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <Tooltip
                  formatter={(value: number) => '฿' + value.toLocaleString()}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
                <Bar
                  dataKey="ยอดขาย"
                  fill="url(#colorProduct)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Shops */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Store className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">ร้านค้ายอดนิยม</h2>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={stats?.topShops.slice(0, 5).map(s => ({
                  name: s.shopName.length > 10 ? s.shopName.substring(0, 10) + '...' : s.shopName,
                  ยอดขาย: s.totalRevenue,
                }))}
                margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
                barSize={50}
                barCategoryGap="20%"
              >
                <defs>
                  <linearGradient id="colorShop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <YAxis
                  tickFormatter={(value) => '฿' + (value / 1000).toFixed(0) + 'K'}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <Tooltip
                  formatter={(value: number) => '฿' + value.toLocaleString()}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
                <Bar
                  dataKey="ยอดขาย"
                  fill="url(#colorShop)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">ยอดขาย 30 วันล่าสุด</h2>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={stats?.revenueByDate.slice(-30).map(d => ({
                วันที่: new Date(d.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
                ยอดขาย: d.revenue,
                คำสั่งซื้อ: d.orderCount * 1000, // Scale up for better visibility
              }))}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="วันที่"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => '฿' + (value / 1000).toFixed(0) + 'K'}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'ยอดขาย') {
                    return ['฿' + value.toLocaleString(), name];
                  } else {
                    return [(value / 1000).toFixed(0) + ' รายการ', 'คำสั่งซื้อ'];
                  }
                }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="ยอดขาย"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="คำสั่งซื้อ"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOrders)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  badge,
  badgeLabel,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  badge?: number;
  badgeLabel?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }[color];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <Icon className="h-6 w-6" />
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            {badge} {badgeLabel}
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}
