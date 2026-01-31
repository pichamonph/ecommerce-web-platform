'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import api from '@/lib/api';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  canRemove?: boolean;
  type?: 'product' | 'profile' | 'shop';
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  canRemove = false,
  type = 'product',
  label
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/files/upload/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onChange(response.data.url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'อัปโหลดไฟล์ไม่สำเร็จ');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      return `http://localhost:8080/api${url}`;
    }
    return url;
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      <div className="flex gap-2 items-start">
        {/* Preview or Upload Button */}
        {value ? (
          <div className="relative group flex-1">
            <img
              src={getImageUrl(value)}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
              >
                เปลี่ยนรูป
              </button>
              {canRemove && onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                >
                  ลบ
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">กำลังอัปโหลด...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <span className="text-sm font-medium">คลิกเพื่ออัปโหลดรูปภาพ</span>
                <span className="text-xs text-gray-400">JPG, PNG, GIF (สูงสุด 5MB)</span>
              </>
            )}
          </button>
        )}

        {/* Remove button for when image exists and canRemove */}
        {value && canRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
