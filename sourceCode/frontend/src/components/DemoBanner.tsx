'use client';

import { AlertCircle, TestTube2 } from 'lucide-react';

export default function DemoBanner() {
  const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'DEMO';
  
  if (!isDemoMode) return null;
  
  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <TestTube2 className="h-5 w-5 flex-shrink-0" />
        <div className="text-center">
          <p className="font-semibold">
            ⚠️ โหมด DEMO - ระบบทดสอบ
          </p>
          <p className="text-sm">
            การชำระเงินทั้งหมดเป็นการจำลอง ไม่มีการหักเงินจริง
          </p>
        </div>
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
      </div>
    </div>
  );
}
