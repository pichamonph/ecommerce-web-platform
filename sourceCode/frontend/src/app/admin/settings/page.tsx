'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';
import {
  Save,
  Loader2,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface SiteSettings {
  site_name: string;
  site_email: string;
  site_phone: string;
  site_address: string;
}

export default function SettingsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<SiteSettings>({
    site_name: '',
    site_email: '',
    site_phone: '',
    site_address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    } else if (isAdmin) {
      fetchSettings();
    }
  }, [authLoading, isAdmin, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get<Record<string, string>>('/admin/settings');
      setSettings({
        site_name: response.data.site_name || '',
        site_email: response.data.site_email || '',
        site_phone: response.data.site_phone || '',
        site_address: response.data.site_address || '',
      });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      showMessage('error', 'ไม่สามารถโหลดการตั้งค่าได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings', settings);
      showMessage('success', 'บันทึกการตั้งค่าสำเร็จ');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showMessage('error', 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (authLoading || loading || !isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
            <p className="text-gray-600 mt-2">จัดการข้อมูลพื้นฐานของเว็บไซต์</p>
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Site Information Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">ข้อมูลเว็บไซต์</h2>
                <p className="text-sm text-gray-600">ข้อมูลพื้นฐานที่แสดงบนเว็บไซต์</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Site Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อเว็บไซต์ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="E-Shop Thailand"
                  />
                </div>
              </div>

              {/* Site Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  อีเมลติดต่อ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={settings.site_email}
                    onChange={(e) => setSettings({ ...settings, site_email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@eshop.com"
                  />
                </div>
              </div>

              {/* Site Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={settings.site_phone}
                    onChange={(e) => setSettings({ ...settings, site_phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="02-123-4567"
                  />
                </div>
              </div>

              {/* Site Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ที่อยู่บริษัท
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    value={settings.site_address}
                    onChange={(e) => setSettings({ ...settings, site_address: e.target.value })}
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    บันทึกการตั้งค่า
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
