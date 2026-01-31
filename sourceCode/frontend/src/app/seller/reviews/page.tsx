'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/contexts/ShopContext';
import {
  Star,
  MessageSquare,
  User,
  Calendar,
  Package,
  TrendingUp,
  Search,
  Filter,
  ThumbsUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import api from '@/lib/api';

interface Review {
  id: number;
  userId: number;
  userName?: string;
  userProfileImage?: string;
  productId: number;
  productName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  helpful?: number;
  shopReply?: string;
  repliedAt?: string;
}

export default function ReviewsPage() {
  const router = useRouter();
  const { shop, loading: shopLoading } = useShop();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!shopLoading && shop) {
      fetchReviews();
    }
  }, [shop, shopLoading]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/reviews/seller/my-shop-reviews', {
        params: { page: 0, size: 100 } // Get first 100 reviews
      });

      const data = response.data;
      const reviewsData = data.content || [];

      setReviews(reviewsData);
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
      const errorData = error.response?.data;

      let errorMessage = 'ไม่สามารถโหลดข้อมูลรีวิวได้';
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }

      if (error.response?.status === 400 && errorMessage.includes('does not have a shop')) {
        setError('คุณยังไม่มีร้านค้า กรุณาสร้างร้านค้าก่อน');
        router.push('/seller/create-shop');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId: number) => {
    if (!shop) return;
    if (!replyText.trim()) {
      setError('กรุณาใส่ข้อความตอบกลับ');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await api.post(`/reviews/${reviewId}/reply`, replyText, {
        params: { shopId: shop.id },
        headers: { 'Content-Type': 'text/plain' }
      });

      setSuccess('ตอบกลับรีวิวสำเร็จ');
      setReplyingTo(null);
      setReplyText('');
      fetchReviews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Failed to reply:', error);
      setError(error.response?.data || 'ไม่สามารถตอบกลับได้');
      setTimeout(() => setError(''), 5000);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === null || review.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0
      ? ((reviews.filter((r) => r.rating === rating).length / reviews.length) * 100).toFixed(0)
      : '0',
  }));

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (shopLoading || loading) {
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

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">รีวิวสินค้า</h1>
        <p className="text-white/80 text-sm">รีวิวและความคิดเห็นจากลูกค้า</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6 pb-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Rating */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
                  <Star className="h-10 w-10 text-white fill-white" />
                </div>
                <p className="text-5xl font-bold text-gray-900 mb-2">{averageRating}</p>
                <StarRating rating={Math.round(parseFloat(averageRating))} />
                <p className="text-sm text-gray-600 mt-2">จาก {reviews.length} รีวิว</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 md:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">การกระจายคะแนน</h3>
              <div className="space-y-2">
                {ratingDistribution.map((item) => (
                  <div key={item.rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ค้นหารีวิว..."
                />
              </div>

              {/* Rating Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setRatingFilter(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    ratingFilter === null
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ทั้งหมด
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(rating)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      ratingFilter === rating
                        ? 'bg-yellow-400 text-gray-900 shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rating}
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {filteredReviews.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่มีรีวิว</h3>
                <p className="text-gray-500">
                  {searchQuery || ratingFilter ? 'ไม่พบรีวิวที่ตรงกับเงื่อนไข' : 'ยังไม่มีรีวิวสินค้าในร้านค้า'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        {review.userProfileImage ? (
                          <img
                            src={review.userProfileImage}
                            alt={review.userName || 'User'}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {review.userName?.[0] || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{review.userName}</p>
                            <span className="text-gray-400">·</span>
                            <StarRating rating={review.rating} />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Package className="h-3.5 w-3.5" />
                            <span>{review.productName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(review.createdAt).toLocaleDateString('th-TH')}</span>
                        </div>
                      </div>
                    </div>

                    {review.comment && (
                      <div className="mb-4 ml-16">
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    )}

                    {/* Shop Reply */}
                    {review.shopReply && (
                      <div className="ml-16 mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {shop?.name?.[0] || 'S'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-blue-900">{shop?.name || 'ร้านค้า'}</p>
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">ตอบกลับจากร้านค้า</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{review.shopReply}</p>
                            {review.repliedAt && (
                              <p className="text-xs text-gray-500 mt-2">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {new Date(review.repliedAt).toLocaleDateString('th-TH')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === review.id && (
                      <div className="ml-16 mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="เขียนคำตอบของคุณ..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleReply(review.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            ส่งคำตอบ
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="ml-16 flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{review.helpful || 0} คนเห็นว่ามีประโยชน์</span>
                      </div>
                      {!review.shopReply && (
                        <button
                          onClick={() => {
                            setReplyingTo(review.id);
                            setReplyText('');
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          ตอบกลับ
                        </button>
                      )}
                      {review.shopReply && (
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          ตอบกลับแล้ว
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
