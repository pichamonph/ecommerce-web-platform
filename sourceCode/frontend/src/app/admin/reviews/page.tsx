'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ComingSoon from '@/components/admin/ComingSoon';

export default function ReviewManagementPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <ComingSoon
        title="Review Management"
        description="จัดการรีวิว ลบรีวิวที่ไม่เหมาะสม ตรวจสอบรีวิวปลอม และดูรายงาน"
      />
    </AdminLayout>
  );
}
