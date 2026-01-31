'use client';

import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface ReviewModalProps {
  productId: number;
  productName: string;
  orderItemId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewModal({ productId, productName, orderItemId, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('กรุณาให้คะแนน');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/reviews', {
        productId,
        orderItemId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to submit review:', error);

      // Handle 409 Conflict - Already reviewed
      if (error.response?.status === 409) {
        setError('คุณได้รีวิวสินค้านี้จากคำสั่งซื้อนี้แล้ว');
      } else {
        const errorMsg = error.response?.data || 'ไม่สามารถส่งรีวิวได้';
        setError(typeof errorMsg === 'string' ? errorMsg : 'ไม่สามารถส่งรีวิวได้');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold">รีวิวสินค้า</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">สินค้า</p>
            <p className="font-semibold text-gray-900">{productName}</p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ให้คะแนน <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-lg p-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    className={`h-12 w-12 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {rating === 1 && 'แย่มาก'}
              {rating === 2 && 'แย่'}
              {rating === 3 && 'ปานกลาง'}
              {rating === 4 && 'ดี'}
              {rating === 5 && 'ดีมาก'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รีวิวเพิ่มเติม (ไม่บังคับ)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="แบ่งปันประสบการณ์ของคุณกับสินค้านี้..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {comment.length}/500 ตัวอักษร
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                'ส่งรีวิว'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
