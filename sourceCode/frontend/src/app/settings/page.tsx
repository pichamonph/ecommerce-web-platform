'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  MapPin,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Home,
  Building2,
  MapPinned,
} from 'lucide-react';
import api from '@/lib/api';

interface Address {
  id: number;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'security' | 'addresses' | null;
  const [activeTab, setActiveTab] = useState<'security' | 'addresses'>(tabParam || 'security');

  // Security states
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phone: '',
    line1: '',
    line2: '',
    subdistrict: '',
    district: '',
    province: '',
    postalCode: '',
    country: 'Thailand',
    isDefault: false,
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      console.log('Fetching addresses...');
      const response = await api.get<Address[]>('/addresses');
      console.log('Addresses fetched:', response.data);
      setAddresses(response.data);
    } catch (error: any) {
      console.error('Failed to fetch addresses:', error);
      console.error('Fetch error response:', error.response);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.put('/users/me/password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      setSuccess('เปลี่ยนรหัสผ่านสำเร็จ');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      console.log('Saving address:', addressForm);

      if (editingAddress) {
        // Update
        console.log('Updating address:', editingAddress.id);
        await api.put(`/addresses/${editingAddress.id}`, addressForm);
        setSuccess('อัปเดตที่อยู่สำเร็จ');
      } else {
        // Create
        console.log('Creating new address');
        await api.post('/addresses', addressForm);
        setSuccess('เพิ่มที่อยู่สำเร็จ');
      }

      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
      await fetchAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Address save error:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || 'บันทึกที่อยู่ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('คุณต้องการลบที่อยู่นี้หรือไม่?')) return;

    try {
      setLoading(true);
      await api.delete(`/addresses/${id}`);
      setSuccess('ลบที่อยู่สำเร็จ');
      await fetchAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'ลบที่อยู่ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      recipientName: address.recipientName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || '',
      subdistrict: address.subdistrict || '',
      district: address.district || '',
      province: address.province || '',
      postalCode: address.postalCode || '',
      country: address.country,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      recipientName: '',
      phone: '',
      line1: '',
      line2: '',
      subdistrict: '',
      district: '',
      province: '',
      postalCode: '',
      country: 'Thailand',
      isDefault: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ตั้งค่า</h1>
          <p className="text-gray-600">จัดการความปลอดภัยและข้อมูลส่วนตัว</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'security'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Lock className="h-5 w-5" />
              <span>ความปลอดภัย</span>
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'addresses'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MapPin className="h-5 w-5" />
              <span>ที่อยู่จัดส่ง</span>
            </button>
          </div>

          <div className="p-6">
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">เปลี่ยนรหัสผ่าน</h3>
                  <p className="text-sm text-gray-600">กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Old Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสผ่านเดิม
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.old ? 'text' : 'password'}
                        value={passwords.oldPassword}
                        onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.old ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสผ่านใหม่
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
                  </button>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">ที่อยู่จัดส่ง</h3>
                    <p className="text-sm text-gray-600">จัดการที่อยู่สำหรับการจัดส่งสินค้า</p>
                  </div>
                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        resetAddressForm();
                        setShowAddressForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Plus className="h-5 w-5" />
                      เพิ่มที่อยู่ใหม่
                    </button>
                  )}
                </div>

                {/* Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {editingAddress ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ชื่อผู้รับ *
                        </label>
                        <input
                          type="text"
                          value={addressForm.recipientName}
                          onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          เบอร์โทรศัพท์ *
                        </label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ที่อยู่ (บ้านเลขที่, ถนน) *
                        </label>
                        <input
                          type="text"
                          value={addressForm.line1}
                          onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ที่อยู่เพิ่มเติม (อาคาร, ห้อง)
                        </label>
                        <input
                          type="text"
                          value={addressForm.line2}
                          onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ตำบล/แขวง
                        </label>
                        <input
                          type="text"
                          value={addressForm.subdistrict}
                          onChange={(e) => setAddressForm({ ...addressForm, subdistrict: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          อำเภอ/เขต
                        </label>
                        <input
                          type="text"
                          value={addressForm.district}
                          onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          จังหวัด
                        </label>
                        <input
                          type="text"
                          value={addressForm.province}
                          onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          รหัสไปรษณีย์
                        </label>
                        <input
                          type="text"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength={5}
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 mt-4">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">ตั้งเป็นที่อยู่หลัก</span>
                    </label>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          resetAddressForm();
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </form>
                )}

                {/* Address List */}
                <div className="space-y-4">
                  {addresses.length === 0 && !showAddressForm && (
                    <div className="text-center py-12">
                      <MapPinned className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">ยังไม่มีที่อยู่จัดส่ง</p>
                      <p className="text-sm text-gray-500">กดปุ่ม "เพิ่มที่อยู่ใหม่" เพื่อเพิ่มที่อยู่</p>
                    </div>
                  )}

                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-5 border-2 rounded-xl transition-all ${
                        address.isDefault
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{address.recipientName}</h4>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                ที่อยู่หลัก
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                          <p className="text-sm text-gray-700">
                            {address.line1}
                            {address.line2 && ` ${address.line2}`}
                            {address.subdistrict && ` ต.${address.subdistrict}`}
                            {address.district && ` อ.${address.district}`}
                            {address.province && ` จ.${address.province}`}
                            {address.postalCode && ` ${address.postalCode}`}
                          </p>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="แก้ไข"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="ลบ"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
