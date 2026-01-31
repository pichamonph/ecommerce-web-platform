'use client';

import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { wishlistApi } from '@/lib/api/wishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
  productId: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
}

export default function WishlistButton({
  productId,
  size = 'md',
  variant = 'icon'
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      checkWishlist();
    } else {
      setChecking(false);
    }
  }, [productId, isAuthenticated]);

  const checkWishlist = async () => {
    try {
      setChecking(true);
      const inWishlist = await wishlistApi.check(productId);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const result = await wishlistApi.toggle(productId);
      setIsInWishlist(result.isInWishlist);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  if (checking) {
    return (
      <button
        disabled
        className={`${buttonSizes[size]} bg-white rounded-full shadow-md`}
      >
        <Loader2 className={`${iconSizes[size]} text-gray-400 animate-spin`} />
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 border-2 ${
          isInWishlist
            ? 'border-red-500 bg-red-50 text-red-600'
            : 'border-gray-300 bg-white text-gray-700'
        } rounded-lg hover:border-red-500 hover:bg-red-50 transition disabled:opacity-50`}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Heart
            className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`}
          />
        )}
        <span className="font-medium">
          {isInWishlist ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`${buttonSizes[size]} bg-white rounded-full shadow-md hover:scale-110 transition-transform disabled:opacity-50`}
      title={isInWishlist ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} text-red-500 animate-spin`} />
      ) : (
        <Heart
          className={`${iconSizes[size]} ${
            isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
          }`}
        />
      )}
    </button>
  );
}
