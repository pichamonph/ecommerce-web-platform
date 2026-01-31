'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Phone, CheckCircle, AlertCircle, RefreshCw, Clock, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface TrueMoneyWalletProps {
  amount: number;
  orderId?: number;
  onPaymentComplete: () => void;
  onPaymentFailed: (error: string) => void;
  onPhoneNumberSubmit?: (phoneNumber: string) => Promise<void>;
}

interface ChargeResponse {
  id: string;
  status: string;
  amount: number;
  paid: boolean;
  source?: {
    type: string;
    flow: string;
    mobile_number?: string;
  };
  authorize_uri?: string;
}

export default function TrueMoneyWallet({ amount, orderId, onPaymentComplete, onPaymentFailed, onPhoneNumberSubmit }: TrueMoneyWalletProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [chargeId, setChargeId] = useState<string>('');
  const [authorizeUri, setAuthorizeUri] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [step, setStep] = useState<'phone' | 'pending' | 'processing'>('phone');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [error, setError] = useState('');
  const [savedPhoneNumber, setSavedPhoneNumber] = useState<string>('');

  // When orderId becomes available and we have saved phone number, create charge
  useEffect(() => {
    if (orderId && savedPhoneNumber && !chargeId && step === 'phone') {
      // Create charge with saved phone number
      createChargeWithOrderId(savedPhoneNumber);
    }
  }, [orderId, savedPhoneNumber]);

  useEffect(() => {
    if (step !== 'pending' || timeLeft <= 0) return;

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
  }, [step, timeLeft]);

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');
    // Thai mobile number validation (10 digits starting with 0)
    return /^0[0-9]{9}$/.test(cleaned);
  };

  const formatPhoneNumber = (phone: string): string => {
    // Format: 0XX-XXX-XXXX
    const cleaned = phone.replace(/[\s-]/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const createChargeWithOrderId = async (cleanedPhone: string) => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/payments/omise/charges', {
        amount: amount,
        currency: 'THB',
        paymentMethod: 'OMISE_TRUEMONEY',
        orderId: orderId,
        description: `Order #${orderId}`,
        phoneNumber: cleanedPhone,
      });

      const data: ChargeResponse = response.data;

      if (data.id) {
        setChargeId(data.id);
        
        if (data.authorize_uri) {
          setAuthorizeUri(data.authorize_uri);
          // Open in new window/tab
          window.open(data.authorize_uri, '_blank');
        }

        setStep('pending');
        setTimeLeft(600);
      } else {
        throw new Error('ไม่สามารถสร้างการชำระเงินได้');
      }
    } catch (err: any) {
      console.error('Failed to create TrueMoney charge:', err);
      const errorMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      setError(errorMessage);
      onPaymentFailed(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createTrueMoneyCharge = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (10 หลัก)');
      return;
    }

    const cleanedPhone = phoneNumber.replace(/[\s-]/g, '');

    // If onPhoneNumberSubmit is provided and no orderId, call it to create order first
    if (!orderId && onPhoneNumberSubmit) {
      try {
        setLoading(true);
        setError('');
        
        // Save phone number for later use
        setSavedPhoneNumber(cleanedPhone);
        
        // Create order first
        await onPhoneNumberSubmit(cleanedPhone);
        
        // After order is created, useEffect will trigger to create charge
      } catch (err: any) {
        console.error('Failed to create order:', err);
        const errorMessage = err.response?.data?.message || err.message || 'ไม่สามารถสร้างคำสั่งซื้อได้';
        setError(errorMessage);
        setLoading(false);
      }
      return;
    }

    // If orderId already exists, create charge directly
    if (orderId) {
      await createChargeWithOrderId(cleanedPhone);
    } else {
      setError('ไม่พบรหัสคำสั่งซื้อ');
    }
  };

  const checkPaymentStatus = async () => {
    if (!chargeId) return;

    try {
      setChecking(true);
      setStep('processing');

      const response = await api.get(`/payments/omise/charges/${chargeId}`);
      const data: ChargeResponse = response.data;

      if (data.paid && (data.status === 'successful' || data.status === 'paid')) {
        onPaymentComplete();
      } else if (data.status === 'failed') {
        onPaymentFailed('การชำระเงินล้มเหลว');
        setStep('phone');
      } else {
        setStep('pending');
      }
    } catch (err: any) {
      console.error('Failed to check payment status:', err);
      setError('ไม่สามารถตรวจสอบสถานะได้');
      setStep('pending');
    } finally {
      setChecking(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhoneNumber('');
    setChargeId('');
    setAuthorizeUri('');
    setError('');
    setTimeLeft(600);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'phone') {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Smartphone className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">ชำระเงินผ่าน TrueMoney Wallet</h3>
            <p className="text-sm text-gray-500">กรอกเบอร์โทรศัพท์ที่ลงทะเบียน TrueMoney</p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center mb-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6">
          <p className="text-sm text-gray-600 mb-1">ยอดชำระ</p>
          <p className="text-3xl font-bold text-gray-900">฿{amount.toLocaleString()}</p>
        </div>

        {/* Phone Number Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เบอร์โทรศัพท์ <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setError('');
              }}
              placeholder="0XX-XXX-XXXX"
              maxLength={12}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            กรอกเบอร์โทรศัพท์ที่ลงทะเบียนกับ TrueMoney Wallet
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={createTrueMoneyCharge}
          disabled={loading || !phoneNumber.trim()}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              กำลังดำเนินการ...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              ชำระเงิน ฿{amount.toLocaleString()}
            </>
          )}
        </button>

        {/* Info */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">ข้อมูลสำคัญ:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>ตรวจสอบยอดเงินคงเหลือใน TrueMoney Wallet ของคุณ</li>
            <li>หน้าต่างใหม่จะเปิดขึ้นเพื่อยืนยันการชำระเงิน</li>
            <li>กรุณาอย่าปิดหน้านี้จนกว่าจะชำระเงินเสร็จสมบูรณ์</li>
          </ul>
        </div>
      </div>
    );
  }

  if (step === 'pending') {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Smartphone className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">รอยืนยันการชำระเงิน</h3>
            <p className="text-sm text-gray-500">กรุณายืนยันใน TrueMoney Wallet</p>
          </div>
        </div>

        {/* Amount & Phone */}
        <div className="text-center mb-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6">
          <p className="text-sm text-gray-600 mb-1">ยอดชำระ</p>
          <p className="text-3xl font-bold text-gray-900 mb-3">฿{amount.toLocaleString()}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{formatPhoneNumber(phoneNumber)}</span>
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center justify-center gap-2 p-3 rounded-lg mb-6 ${
          timeLeft < 60 ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
        }`}>
          <Clock className="h-5 w-5" />
          <span className="font-semibold">
            เหลือเวลา: {formatTime(timeLeft)}
          </span>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
              1
            </div>
            <p>กดปุ่มด้านล่างเพื่อเปิดหน้าต่าง TrueMoney (ถ้ายังไม่เปิด)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
              2
            </div>
            <p>ตรวจสอบรายละเอียดและยืนยันการชำระเงิน</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
              3
            </div>
            <p>กลับมาที่หน้านี้และกด "ตรวจสอบสถานะ"</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {authorizeUri && (
            <button
              onClick={() => window.open(authorizeUri, '_blank')}
              className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2"
            >
              <Smartphone className="h-5 w-5" />
              เปิด TrueMoney Wallet
            </button>
          )}

          <button
            onClick={checkPaymentStatus}
            disabled={checking}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                กำลังตรวจสอบ...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                ตรวจสอบสถานะการชำระเงิน
              </>
            )}
          </button>

          <button
            onClick={resetForm}
            disabled={checking}
            className="w-full py-2 text-gray-600 hover:text-gray-900 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            เริ่มใหม่
          </button>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-500 mt-4">
          ระบบจะตรวจสอบอัตโนมัติเมื่อชำระเงินสำเร็จ
        </p>
      </div>
    );
  }

  // Processing state
  return (
    <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">กำลังตรวจสอบสถานะการชำระเงิน...</p>
      <p className="text-sm text-gray-500 mt-2">กรุณารอสักครู่</p>
    </div>
  );
}
