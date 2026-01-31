'use client';

import { useEffect, useState } from 'react';
import { QrCode, Smartphone, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';

interface PromptPayQRProps {
  amount: number;
  orderId: number;
  onPaymentComplete: () => void;
  onPaymentFailed: (error: string) => void;
}

interface ChargeResponse {
  id: string;
  status: string;
  amount: number;
  paid: boolean;
  source?: {
    type: string;
    scannable_code?: {
      type: string;
      image?: {
        download_uri: string;
      };
      value: string;
    };
  };
}

export default function PromptPayQR({ amount, orderId, onPaymentComplete, onPaymentFailed }: PromptPayQRProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [chargeId, setChargeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [error, setError] = useState('');

  useEffect(() => {
    createPromptPayCharge();
  }, []);

  useEffect(() => {
    if (!chargeId || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onPaymentFailed('หมดเวลาชำระเงิน กรุณาสั่งซื้อใหม่อีกครั้ง');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [chargeId, timeLeft]);

  const createPromptPayCharge = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.post('/payments/omise/charges', {
        amount: amount,
        currency: 'THB',
        paymentMethod: 'OMISE_PROMPTPAY',
        orderId: orderId,
        description: `Order #${orderId}`,
      });

      const data: ChargeResponse = response.data;

      if (data.source?.scannable_code?.image?.download_uri) {
        setQrCodeUrl(data.source.scannable_code.image.download_uri);
        setChargeId(data.id);
      } else {
        throw new Error('ไม่พบ QR Code');
      }
    } catch (err: any) {
      console.error('Failed to create PromptPay charge:', err);
      const errorMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      setError(errorMessage);
      onPaymentFailed(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!chargeId) return;

    try {
      setChecking(true);

      const response = await api.get(`/payments/omise/charges/${chargeId}`);
      const data: ChargeResponse = response.data;

      if (data.paid && (data.status === 'successful' || data.status === 'paid')) {
        onPaymentComplete();
      }
    } catch (err: any) {
      console.error('Failed to check payment status:', err);
    } finally {
      setChecking(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังสร้าง QR Code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <div className="flex items-start gap-3 text-red-600 mb-4">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">เกิดข้อผิดพลาด</h3>
            <p className="text-sm text-red-500 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={createPromptPayCharge}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <QrCode className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">ชำระเงินผ่านพร้อมเพย์</h3>
          <p className="text-sm text-gray-500">สแกน QR Code ด้วยแอปธนาคาร</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-lg inline-block mx-auto">
          {qrCodeUrl ? (
            <Image
              src={qrCodeUrl}
              alt="PromptPay QR Code"
              width={250}
              height={250}
              className="w-64 h-64 mx-auto"
              priority
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-lg"></div>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 mb-1">ยอดชำระ</p>
        <p className="text-3xl font-bold text-gray-900">฿{amount.toLocaleString()}</p>
      </div>

      {/* Timer */}
      <div className={`flex items-center justify-center gap-2 p-3 rounded-lg mb-6 ${
        timeLeft < 60 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
      }`}>
        <Clock className="h-5 w-5" />
        <span className="font-semibold">
          เหลือเวลา: {formatTime(timeLeft)}
        </span>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3 text-sm text-gray-700">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
            1
          </div>
          <p>เปิดแอปพลิเคชันธนาคารที่รองรับพร้อมเพย์</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
            2
          </div>
          <p>เลือกเมนูสแกน QR Code</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
            3
          </div>
          <p>สแกน QR Code ด้านบนและยืนยันการชำระเงิน</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
            4
          </div>
          <p>กด "ตรวจสอบสถานะ" หลังชำระเงินเรียบร้อย</p>
        </div>
      </div>

      {/* Check Status Button */}
      <button
        onClick={checkPaymentStatus}
        disabled={checking}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {checking ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            กำลังตรวจสอบ...
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            ตรวจสอบสถานะการชำระเงิน
          </>
        )}
      </button>

      {/* Help Text */}
      <p className="text-center text-xs text-gray-500 mt-4">
        ระบบจะตรวจสอบอัตโนมัติเมื่อชำระเงินสำเร็จ
      </p>
    </div>
  );
}
