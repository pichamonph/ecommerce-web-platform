'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/contexts/ShopContext';
import { Store, AlertCircle, CheckCircle } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

export default function CreateShopPage() {
  const router = useRouter();
  const { createShop, hasShop, loading: shopLoading } = useShop();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already has shop, redirect to dashboard immediately
  useEffect(() => {
    if (!shopLoading && hasShop) {
      router.replace('/seller/dashboard');
    }
  }, [shopLoading, hasShop, router]);

  // Show loading while checking shop (and redirect if has shop)
  if (shopLoading || hasShop) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const getImageUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      return `http://localhost:8080/api${url}`;
    }
    return url;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createShop(formData);
      router.push('/seller/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'การสร้างร้านค้าล้มเหลว กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
              <Store className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              สร้างร้านค้าของคุณ
            </h1>
            <p className="text-gray-600 text-lg">
              ตั้งค่าร้านค้าเพื่อเริ่มขายสินค้าออนไลน์
            </p>
          </div>

          {/* Info Banner */}
          <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl flex items-start gap-4 shadow-md">
            <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-bold mb-2 text-base">ยินดีด้วย! คุณได้รับอนุมัติเป็น Seller แล้ว</p>
              <p className="text-blue-700">กรุณาสร้างร้านค้าเพื่อเริ่มต้นขายสินค้า</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-4 shadow-md">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อร้านค้า <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="ชื่อร้านค้าของคุณ"
            />
            <p className="mt-1 text-sm text-gray-500">
              ชื่อนี้จะแสดงในหน้าร้านค้าและสินค้าทั้งหมด
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบายร้านค้า
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
              placeholder="บอกลูกค้าเกี่ยวกับร้านค้าของคุณ..."
            />
            <p className="mt-1 text-sm text-gray-500">
              อธิบายสั้นๆ เกี่ยวกับร้านค้า ประเภทสินค้า หรือจุดเด่นของร้าน
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <ImageUpload
              value={getImageUrl(formData.logoUrl)}
              onChange={(url) => setFormData({ ...formData, logoUrl: url })}
              type="shop"
              label="โลโก้ร้านค้า (ไม่บังคับ)"
            />
            <p className="mt-1 text-sm text-gray-500">
              อัปโหลดรูปโลโก้ร้านค้า (JPG, PNG, GIF สูงสุด 5MB)
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'กำลังสร้างร้านค้า...' : 'สร้างร้านค้า'}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-8 p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong className="text-blue-600">💡 หมายเหตุ:</strong> หลังจากสร้างร้านค้าแล้ว คุณจะสามารถเพิ่มสินค้าและจัดการร้านค้าได้ทันที
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
