'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  Store,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Package,
} from 'lucide-react';

export default function BecomeSellerPage() {
  const { user, isSeller, refreshUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: '',
    taxId: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/seller/apply', formData);
      setSuccess(true);
      // Note: User role won't change until admin approves the application
      // So we don't redirect to seller dashboard here
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'การสมัครล้มเหลว กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isSeller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            คุณเป็น Seller แล้ว!
          </h2>
          <p className="text-gray-600 mb-6">
            คุณสามารถเข้าสู่ระบบจัดการร้านค้าได้ทันที
          </p>
          <button
            onClick={() => router.push('/seller/dashboard')}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
          >
            ไปยังแดชบอร์ด
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            เริ่มต้นขายสินค้ากับเรา
          </h1>
          <p className="text-xl text-gray-600">
            สร้างรายได้ออนไลน์ได้ง่ายๆ ไม่มีค่าธรรมเนียมเริ่มต้น
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">จัดการสินค้า</h3>
            <p className="text-sm text-gray-600">เพิ่มและจัดการสินค้าได้ง่าย</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">วิเคราะห์ยอดขาย</h3>
            <p className="text-sm text-gray-600">ติดตามสถิติการขายแบบ real-time</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">รับเงินรวดเร็ว</h3>
            <p className="text-sm text-gray-600">โอนเงินเข้าบัญชีทุกสัปดาห์</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ฐานลูกค้ากว้าง</h3>
            <p className="text-sm text-gray-600">เข้าถึงลูกค้าหลายพันคน</p>
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">สมัครเป็นผู้ขาย</h2>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">ส่งคำขอสมัครสำเร็จ!</p>
                  <p className="text-sm text-green-700 mt-1">
                    คำขอของคุณอยู่ระหว่างการตรวจสอบ
                  </p>
                </div>
              </div>
              <div className="bg-green-100 rounded-lg p-3 ml-8">
                <p className="text-sm text-green-800">
                  <strong>ขั้นตอนถัดไป:</strong>
                </p>
                <ul className="mt-2 text-sm text-green-700 space-y-1">
                  <li>• ทีมงานจะตรวจสอบข้อมูลของคุณภายใน 1-2 วันทำการ</li>
                  <li>• คุณจะได้รับอีเมลแจ้งเตือนเมื่อได้รับการอนุมัติ</li>
                  <li>• หลังจากอนุมัติ คุณจะสามารถเข้าถึงแดชบอร์ดผู้ขายได้ทันที</li>
                </ul>
              </div>
              <div className="mt-4 ml-8">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  กลับหน้าหลัก
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อร้านค้า <span className="text-red-500">*</span>
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="ชื่อที่ลูกค้าจะเห็น"
              />
              <p className="mt-1 text-sm text-gray-500">
                ชื่อนี้จะแสดงในหน้าร้านค้าและสินค้าของคุณ
              </p>
            </div>

            {/* Tax ID */}
            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
                เลขประจำตัวผู้เสียภาษี (ถ้ามี)
              </label>
              <input
                id="taxId"
                name="taxId"
                type="text"
                value={formData.taxId}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="เลข 13 หลัก"
                maxLength={13}
              />
              <p className="mt-1 text-sm text-gray-500">
                สำหรับออกใบเสร็จรับเงิน/ใบกำกับภาษี
              </p>
            </div>

            {/* Note */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={4}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                placeholder="บอกเราเกี่ยวกับประเภทสินค้าที่คุณจะขาย..."
              />
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>เงื่อนไขการเป็นผู้ขาย:</strong>
              </p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>สินค้าต้องถูกต้องตามกฎหมาย</li>
                <li>จัดส่งสินค้าภายในเวลาที่กำหนด</li>
                <li>ให้บริการลูกค้าอย่างสุภาพและเป็นมืออาชีพ</li>
                <li>ไม่ทำการฉ้อโกงหรือละเมิดสิทธิ์ผู้อื่น</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังส่งคำขอ...' : success ? 'สมัครสำเร็จ!' : 'สมัครเป็นผู้ขาย'}
            </button>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            มีคำถาม?{' '}
            <a href="mailto:support@eshop.com" className="text-purple-600 hover:text-purple-700 font-medium">
              ติดต่อฝ่ายสนับสนุน
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
