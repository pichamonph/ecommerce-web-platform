'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get('order_id');
  const chargeId = searchParams.get('ref');
  const status = searchParams.get('status');

  const [checking, setChecking] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('ไม่พบข้อมูลคำสั่งซื้อ');
      setChecking(false);
      return;
    }

    // If demo bank returned with status
    if (status === 'success') {
      handleDemoSuccess();
    } else if (status === 'failed') {
      setPaymentStatus('failed');
      setError('การชำระเงินไม่สำเร็จ');
      setChecking(false);
    } else if (chargeId) {
      // Check payment status from Omise
      checkPaymentStatus();
    } else {
      // Assume success for demo
      handleDemoSuccess();
    }
  }, [orderId, chargeId, status]);

  const handleDemoSuccess = () => {
    console.log('✅ Demo payment success, redirecting to order page...');
    setPaymentStatus('success');
    setChecking(false);

    // Redirect to order page after 2 seconds
    setTimeout(() => {
      router.push(`/orders/${orderId}?success=true`);
    }, 2000);
  };

  const checkPaymentStatus = async () => {
    if (!chargeId) return;

    try {
      console.log('🔍 Checking payment status for charge:', chargeId);
      const response = await api.get(`/payments/omise/charges/${chargeId}`);

      if (response.data.paid) {
        setPaymentStatus('success');
        setTimeout(() => {
          router.push(`/orders/${orderId}?success=true`);
        }, 2000);
      } else {
        setPaymentStatus('pending');
        setError('รอการชำระเงิน กรุณาตรวจสอบอีกครั้ง');
        setChecking(false);
      }
    } catch (err: any) {
      console.error('Failed to check payment status:', err);
      setPaymentStatus('failed');
      setError('ไม่สามารถตรวจสอบสถานะการชำระเงินได้');
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">กำลังตรวจสอบการชำระเงิน</h1>
          <p className="text-gray-600">กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full">
        {paymentStatus === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ชำระเงินสำเร็จ!</h1>
            <p className="text-gray-600 mb-6">กำลังนำท่านไปยังหน้าคำสั่งซื้อ...</p>
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
          </>
        )}

        {paymentStatus === 'failed' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">การชำระเงินไม่สำเร็จ</h1>
            <p className="text-gray-600 mb-6">{error || 'กรุณาลองใหม่อีกครั้ง'}</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/cart')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                กลับไปตะกร้า
              </button>
              <button
                onClick={() => router.push(`/orders/${orderId}`)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ดูคำสั่งซื้อ
              </button>
            </div>
          </>
        )}

        {paymentStatus === 'pending' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
              <AlertTriangle className="h-12 w-12 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">รอการชำระเงิน</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push(`/orders/${orderId}`)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ดูคำสั่งซื้อ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
