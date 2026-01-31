'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/contexts/ShopContext';

export default function SellerLandingPage() {
  const router = useRouter();
  const { shop, loading: shopLoading } = useShop();

  useEffect(() => {
    if (!shopLoading) {
      if (shop) {
        // Has shop -> go to dashboard
        router.replace('/seller/dashboard');
      } else {
        // No shop -> go to create shop
        router.replace('/seller/create-shop');
      }
    }
  }, [shop, shopLoading, router]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  );
}
