'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/contexts/ShopContext';
import { Store, Edit, Save, X, Upload, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';

export default function ShopManagementPage() {
  const router = useRouter();
  const { shop, loading, updateShop } = useShop();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    description: shop?.description || '',
    logoUrl: shop?.logoUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Update form data when shop loads
  useState(() => {
    if (shop) {
      setFormData({
        name: shop.name || '',
        description: shop.description || '',
        logoUrl: shop.logoUrl || '',
      });
    }
  });

  if (loading) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      await updateShop(shop.id, formData);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'การบันทึกล้มเหลว กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: shop.name || '',
      description: shop.description || '',
      logoUrl: shop.logoUrl || '',
    });
    setIsEditing(false);
    setError('');
    setLogoPreview(null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    setUploadingLogo(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/files/upload/shop', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.url;
      setFormData(prev => ({ ...prev, logoUrl: imageUrl }));
      setLogoPreview(imageUrl);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        'การอัปโหลดรูปภาพล้มเหลว กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">จัดการร้านค้า</h1>
        <p className="text-white/80 text-sm">แก้ไขข้อมูลและตั้งค่าร้านค้าของคุณ</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Store className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">ข้อมูลร้านค้า</h2>
                    <p className="text-gray-600 mt-1">จัดการข้อมูลพื้นฐานของร้านค้า</p>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Edit className="h-5 w-5" />
                    แก้ไข
                  </button>
                )}
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 shadow-md">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 font-medium">บันทึกข้อมูลสำเร็จ!</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-md">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Content */}
            <div className="p-8 space-y-6">
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อร้านค้า
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            ) : (
              <p className="text-lg text-gray-900">{shop.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบายร้านค้า
            </label>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            ) : (
              <p className="text-gray-700">{shop.description || 'ไม่มีคำอธิบาย'}</p>
            )}
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              โลโก้ร้านค้า
            </label>
            {isEditing ? (
              <>
                <div className="space-y-3">
                  {/* File Upload Button */}
                  <div>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition ${
                        uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingLogo ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600">กำลังอัปโหลด...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-600">เลือกรูปภาพ</span>
                        </>
                      )}
                    </label>
                    <p className="mt-1 text-xs text-gray-500">รองรับไฟล์ JPG, PNG, GIF (ไม่เกิน 5MB)</p>
                  </div>

                  {/* Preview */}
                  {(logoPreview || formData.logoUrl) && (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview || formData.logoUrl}
                        alt="Logo preview"
                        className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="%23e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="14">ไม่สามารถโหลดรูป</text></svg>';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, logoUrl: '' }));
                          setLogoPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {shop.logoUrl ? (
                  <img
                    src={shop.logoUrl}
                    alt={shop.name}
                    className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="%23e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="14">ไม่สามารถโหลดรูป</text></svg>';
                    }}
                  />
                ) : (
                  <div className="h-32 w-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">ไม่มีโลโก้</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Shop Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานะร้านค้า
            </label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              shop.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {shop.status === 'ACTIVE' ? 'เปิดใช้งาน' : shop.status}
            </span>
          </div>

              {/* Action Buttons (Edit Mode) */}
              {isEditing && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    <Save className="h-5 w-5" />
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all shadow-md hover:shadow-lg disabled:opacity-50 transform hover:scale-105"
                  >
                    <X className="h-5 w-5" />
                    ยกเลิก
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
