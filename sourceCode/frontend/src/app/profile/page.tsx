'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  Settings,
  LogOut,
  Camera,
  Edit,
  Save,
  X,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Truck,
  CreditCard
} from 'lucide-react';
import api from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';

interface UserProfile {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  role: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getImageUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      return `http://localhost:8080/api${url}`;
    }
    return url;
  };

  useEffect(() => {
    // Wait for auth loading to complete before redirecting
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only fetch data if authenticated
    if (!authLoading && isAuthenticated) {
      fetchProfile();
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching profile...');
      const response = await api.get('/users/me');
      console.log('Profile response:', response.data);
      setProfile(response.data);
      setEditForm({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        profileImage: response.data.profileImage || ''
      });
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้';
      setError(errorMessage);

      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        logout();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      // Backend returns Page<OrderDto>, get content array
      const ordersData = response.data.content || response.data;
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Ignore error if orders API is not available yet
      setOrders([]);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await api.put('/users/me', editForm);
      setSuccess('อัพเดทข้อมูลสำเร็จ');
      setIsEditing(false);
      await fetchProfile(); // Fetch updated profile
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'ไม่สามารถอัพเดทข้อมูลได้');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'รอดำเนินการ';
      case 'processing':
        return 'กำลังจัดเตรียม';
      case 'shipped':
        return 'กำลังจัดส่ง';
      case 'delivered':
        return 'จัดส่งแล้ว';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  // Show loading while checking authentication or loading profile
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่สามารถโหลดข้อมูลได้</h2>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                    {profile.profileImage ? (
                      <img src={getImageUrl(profile.profileImage)} alt={profile.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsEditing(true);
                    }}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-700 transition"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-center">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : profile.username}
                </h2>
                <p className="text-blue-100 text-sm text-center mt-1">{profile.email}</p>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">ข้อมูลส่วนตัว</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'orders'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span className="font-medium">ประวัติการสั่งซื้อ</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">ตั้งค่า</span>
                </button>

                <div className="border-t border-gray-100 my-2"></div>

                {profile.role === 'SELLER' && (
                  <button
                    onClick={() => router.push('/seller/products')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span className="font-medium">จัดการร้านค้า</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">ออกจากระบบ</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">ข้อมูลส่วนตัว</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Edit className="h-4 w-4" />
                      แก้ไข
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            firstName: profile.firstName || '',
                            lastName: profile.lastName || '',
                            email: profile.email || '',
                            phone: profile.phone || '',
                            profileImage: profile.profileImage || ''
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        <X className="h-4 w-4" />
                        ยกเลิก
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <Save className="h-4 w-4" />
                        บันทึก
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Image Upload (Edit Mode) */}
                {isEditing && (
                  <div className="mb-6">
                    <ImageUpload
                      value={editForm.profileImage}
                      onChange={(url) => setEditForm(prev => ({ ...prev, profileImage: url }))}
                      type="profile"
                      label="รูปโปรไฟล์"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ชื่อ"
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                        {profile.firstName || '-'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      นามสกุล
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="นามสกุล"
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                        {profile.lastName || '-'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {profile.email || '-'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0XX-XXX-XXXX"
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {profile.phone || '-'}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อผู้ใช้
                    </label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {profile.username}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      บทบาท
                    </label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        profile.role === 'ADMIN'
                          ? 'bg-red-100 text-red-800'
                          : profile.role === 'SELLER'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {profile.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : profile.role === 'SELLER' ? 'ผู้ขาย' : 'ผู้ใช้ทั่วไป'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">ประวัติการสั่งซื้อ</h2>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีคำสั่งซื้อ</h3>
                    <p className="text-gray-600 mb-6">เริ่มต้นช็อปปิ้งกับเราวันนี้!</p>
                    <button
                      onClick={() => router.push('/products')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      เริ่มช็อปปิ้ง
                    </button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            คำสั่งซื้อ #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusText(order.status)}
                        </span>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <div className="space-y-2 mb-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {item.productName} x {item.quantity}
                              </span>
                              <span className="text-gray-900 font-medium">
                                ฿{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-lg font-semibold text-gray-900">ยอดรวม</span>
                          <span className="text-2xl font-bold text-blue-600">
                            ฿{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">ตั้งค่า</h2>

                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">เปลี่ยนรหัสผ่าน</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          รหัสผ่านปัจจุบัน
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          รหัสผ่านใหม่
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ยืนยันรหัสผ่านใหม่
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                      </div>
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        เปลี่ยนรหัสผ่าน
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">การแจ้งเตือน</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-gray-700">แจ้งเตือนคำสั่งซื้อ</span>
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-gray-700">แจ้งเตือนโปรโมชัน</span>
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-gray-700">แจ้งเตือนสินค้าใหม่</span>
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
