'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';
import {
  Filter,
  CheckCircle2,
  XCircle,
  Store,
  User,
  Mail,
  FileText,
  Hash,
  Clock,
  AlertCircle,
  Ban,
  ShoppingBag,
  Calendar,
} from 'lucide-react';

interface SellerApplication {
  id: number;
  userId: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  note: string;
  taxId: string;
  status: string;
}

interface Shop {
  id: number;
  ownerId: number;
  ownerUsername: string;
  ownerEmail: string;
  name: string;
  description: string;
  logoUrl: string | null;
  status: string;
  suspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ShopManagementPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [suspendedFilter, setSuspendedFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'applications' | 'shops'>('applications');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'applications') {
        fetchApplications();
      } else {
        fetchShops();
      }
    }
  }, [isAdmin, statusFilter, suspendedFilter, activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get<SellerApplication[]>(`/admin/applications?${params.toString()}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (suspendedFilter) params.append('suspended', suspendedFilter);

      const response = await api.get<Shop[]>(`/admin/shops?${params.toString()}`);
      setShops(response.data);
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: number) => {
    try {
      await api.put(`/admin/applications/${applicationId}/approve`);
      alert('✅ อนุมัติสำเร็จ!\n\nผู้ใช้ต้อง Logout และ Login ใหม่เพื่อใช้งานระบบ Seller');
      fetchApplications();
    } catch (error) {
      console.error('Failed to approve application:', error);
      alert('❌ อนุมัติไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleReject = async (applicationId: number) => {
    try {
      await api.put(`/admin/applications/${applicationId}/reject`);
      fetchApplications();
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  const handleSuspendShop = async (shopId: number) => {
    try {
      await api.put(`/admin/shops/${shopId}/suspend`);
      fetchShops();
    } catch (error) {
      console.error('Failed to suspend shop:', error);
    }
  };

  const handleUnsuspendShop = async (shopId: number) => {
    try {
      await api.put(`/admin/shops/${shopId}/unsuspend`);
      fetchShops();
    } catch (error) {
      console.error('Failed to unsuspend shop:', error);
    }
  };

  const handleRevokeSeller = async (shopId: number, shopName: string) => {
    if (!confirm(`⚠️ คุณแน่ใจหรือไม่?\n\nการถอดสิทธิ์ Seller จะทำให้:\n- ร้าน "${shopName}" ถูกปิดถาวร\n- เจ้าของร้านเปลี่ยนสถานะเป็น USER\n- ต้องสมัครเป็น Seller ใหม่ถ้าต้องการเปิดร้านอีกครั้ง`)) {
      return;
    }

    try {
      await api.put(`/admin/shops/${shopId}/revoke-seller`);
      alert('✅ ถอดสิทธิ์ Seller สำเร็จ\n\nผู้ใช้ต้อง Logout และ Login ใหม่');
      fetchShops();
    } catch (error) {
      console.error('Failed to revoke seller role:', error);
      alert('❌ ถอดสิทธิ์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'รออนุมัติ', icon: Clock },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'อนุมัติแล้ว', icon: CheckCircle2 },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'ปฏิเสธ', icon: XCircle },
    };
    return badges[status as keyof typeof badges] || badges.PENDING;
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3">
              <Store className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">การจัดการร้านค้า</h1>
              <p className="text-sm text-gray-500">อนุมัติคำขอและจัดการร้านค้า</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'applications'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                คำขอเปิดร้าน
              </div>
            </button>
            <button
              onClick={() => setActiveTab('shops')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'shops'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                ร้านค้าทั้งหมด
              </div>
            </button>
          </div>

          {/* Filter & Stats */}
          <div className="mt-6">
            {activeTab === 'applications' ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">ทั้งหมด</option>
                    <option value="PENDING">รออนุมัติ</option>
                    <option value="APPROVED">อนุมัติแล้ว</option>
                    <option value="REJECTED">ปฏิเสธ</option>
                  </select>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <div className="px-4 py-2 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700 font-medium">
                      ทั้งหมด: <span className="font-bold">{applications.length}</span>
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-yellow-50 rounded-lg">
                    <span className="text-sm text-yellow-700 font-medium">
                      รออนุมัติ: <span className="font-bold">{applications.filter(a => a.status === 'PENDING').length}</span>
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-700 font-medium">
                      อนุมัติแล้ว: <span className="font-bold">{applications.filter(a => a.status === 'APPROVED').length}</span>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <select
                    value={suspendedFilter}
                    onChange={(e) => setSuspendedFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">ทั้งหมด</option>
                    <option value="false">เปิดอยู่</option>
                    <option value="true">ถูกปิด</option>
                  </select>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <div className="px-4 py-2 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700 font-medium">
                      ทั้งหมด: <span className="font-bold">{shops.length}</span>
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-700 font-medium">
                      เปิดอยู่: <span className="font-bold">{shops.filter(s => !s.suspended).length}</span>
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-700 font-medium">
                      ถูกปิด: <span className="font-bold">{shops.filter(s => s.suspended).length}</span>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">กำลังโหลด...</p>
          </div>
        ) : activeTab === 'applications' ? (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ไม่พบคำขอเปิดร้านค้า</p>
              </div>
            ) : (
            applications.map((app) => {
              const statusBadge = getStatusBadge(app.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Application Info */}
                    <div className="flex-1 space-y-4">
                      {/* User Info */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {app.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">{app.username}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusBadge.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {app.firstName || app.lastName
                              ? `${app.firstName || ''} ${app.lastName || ''}`.trim()
                              : 'ไม่ระบุชื่อ'}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                        <div className="flex items-start gap-2">
                          <Store className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">ชื่อร้านค้า</p>
                            <p className="font-medium text-gray-900">{app.displayName || '-'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">อีเมล</p>
                            <p className="font-medium text-gray-900">{app.email}</p>
                          </div>
                        </div>

                        {app.taxId && (
                          <div className="flex items-start gap-2">
                            <Hash className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">เลขประจำตัวผู้เสียภาษี</p>
                              <p className="font-medium text-gray-900">{app.taxId}</p>
                            </div>
                          </div>
                        )}

                        {app.note && (
                          <div className="flex items-start gap-2 md:col-span-2">
                            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">หมายเหตุ</p>
                              <p className="font-medium text-gray-900">{app.note}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {app.status === 'PENDING' && (
                      <div className="flex lg:flex-col gap-3">
                        <button
                          onClick={() => handleApprove(app.id)}
                          className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                        >
                          <XCircle className="h-5 w-5" />
                          ปฏิเสธ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {shops.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ไม่พบร้านค้า</p>
              </div>
            ) : (
              shops.map((shop) => (
                <div key={shop.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Shop Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        {shop.logoUrl ? (
                          <img src={shop.logoUrl} alt={shop.name} className="w-16 h-16 rounded-xl object-cover shadow-lg" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                            {shop.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">{shop.name}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              shop.suspended
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {shop.suspended ? (
                                <><Ban className="h-3 w-3" /> ปิด</>
                              ) : (
                                <><CheckCircle2 className="h-3 w-3" /> เปิด</>
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{shop.description || 'ไม่มีคำอธิบาย'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-20">
                        <div className="flex items-start gap-2">
                          <User className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">เจ้าของร้าน</p>
                            <p className="font-medium text-gray-900">{shop.ownerUsername}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">อีเมล</p>
                            <p className="font-medium text-gray-900">{shop.ownerEmail}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">สร้างเมื่อ</p>
                            <p className="font-medium text-gray-900">
                              {new Date(shop.createdAt).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-3">
                      {shop.suspended ? (
                        <button
                          onClick={() => handleUnsuspendShop(shop.id)}
                          className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                          เปิดร้าน
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSuspendShop(shop.id)}
                            className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                          >
                            <Ban className="h-5 w-5" />
                            ปิดชั่วคราว
                          </button>
                          <button
                            onClick={() => handleRevokeSeller(shop.id, shop.name)}
                            className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                          >
                            <XCircle className="h-5 w-5" />
                            ถอดสิทธิ์ Seller
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
