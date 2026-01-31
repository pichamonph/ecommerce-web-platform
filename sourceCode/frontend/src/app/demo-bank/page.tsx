'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function DemoBankPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chargeId = searchParams.get('ref');
  const returnUri = searchParams.get('return_uri');

  const [processing, setProcessing] = useState(false);

  const handleSuccess = () => {
    setProcessing(true);
    console.log('✅ Simulating successful payment...');

    setTimeout(() => {
      if (returnUri) {
        // Redirect back with success status
        const url = new URL(returnUri);
        url.searchParams.set('status', 'success');
        url.searchParams.set('ref', chargeId || '');
        window.location.href = url.toString();
      } else {
        alert('ไม่พบ return_uri กรุณาตั้งค่า return_uri ใน charge');
      }
    }, 1500);
  };

  const handleFailed = () => {
    setProcessing(true);
    console.log('❌ Simulating failed payment...');

    setTimeout(() => {
      if (returnUri) {
        // Redirect back with failed status
        const url = new URL(returnUri);
        url.searchParams.set('status', 'failed');
        url.searchParams.set('ref', chargeId || '');
        window.location.href = url.toString();
      } else {
        alert('ไม่พบ return_uri กรุณาตั้งค่า return_uri ใน charge');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Bank Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Demo Bank</h1>
          <p className="text-sm text-gray-500 mt-1">Internet Banking - ระบบจำลองเพื่อการทดสอบ</p>
        </div>

        {/* Payment Info */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-gray-900">{chargeId || 'N/A'}</span>
            </div>
            {returnUri && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Return URL:</span>
                <span className="font-mono text-xs text-gray-900 ml-2 break-all">{returnUri}</span>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>หมายเหตุ:</strong> นี่เป็นหน้าจำลองธนาคารสำหรับการทดสอบ
            กดปุ่มด้านล่างเพื่อจำลองผลการชำระเงิน
          </p>
        </div>

        {/* Action Buttons */}
        {!processing ? (
          <div className="space-y-3">
            <button
              onClick={handleSuccess}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle className="h-5 w-5" />
              ชำระเงินสำเร็จ
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={handleFailed}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition flex items-center justify-center gap-2 shadow-lg"
            >
              <XCircle className="h-5 w-5" />
              ชำระเงินไม่สำเร็จ
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              ยกเลิก
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">กำลังดำเนินการ...</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Demo Bank - Simulated Payment Gateway
        </p>
      </div>
    </div>
  );
}
