'use client';

import { useState } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

interface CreditCardFormProps {
  onTokenCreated: (token: string) => void;
  loading?: boolean;
}

export default function CreditCardForm({ onTokenCreated, loading }: CreditCardFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(value);
    }
  };

  const handleExpMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 2 && /^\d*$/.test(value)) {
      const num = parseInt(value);
      if (value === '' || (num >= 1 && num <= 12)) {
        setExpMonth(value);
      }
    }
  };

  const handleExpYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setExpYear(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const validateForm = () => {
    if (cardNumber.length !== 16) {
      setError('กรุณากรอกหมายเลขบัตรให้ครบ 16 หลัก');
      return false;
    }
    if (!cardName.trim()) {
      setError('กรุณากรอกชื่อบนบัตร');
      return false;
    }
    if (!expMonth || !expYear) {
      setError('กรุณากรอกวันหมดอายุ');
      return false;
    }
    if (cvv.length < 3) {
      setError('กรุณากรอก CVV ให้ครบ');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setProcessing(true);
      setError('');

      // Check if Omise is loaded
      if (typeof window === 'undefined' || !(window as any).Omise) {
        throw new Error('Omise.js ยังไม่โหลด กรุณารอสักครู่');
      }

      const Omise = (window as any).Omise;

      // Create Omise token
      Omise.createToken('card', {
        name: cardName,
        number: cardNumber,
        expiration_month: expMonth,
        expiration_year: expYear,
        security_code: cvv,
      }, (statusCode: number, response: any) => {
        setProcessing(false);

        if (statusCode === 200) {
          // Token created successfully
          onTokenCreated(response.id);
        } else {
          // Error creating token
          setError(response.message || 'เกิดข้อผิดพลาดในการตรวจสอบบัตร');
        }
      });

    } catch (err: any) {
      setProcessing(false);
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <CreditCard className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">ข้อมูลบัตรเครดิต/เดบิต</h3>
          <p className="text-sm text-gray-500">รองรับ Visa, Mastercard, JCB</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            หมายเลขบัตร
          </label>
          <input
            type="text"
            value={formatCardNumber(cardNumber)}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            disabled={loading || processing}
            maxLength={19}
          />
        </div>

        {/* Card Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ชื่อบนบัตร
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value.toUpperCase())}
            placeholder="JOHN DOE"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            disabled={loading || processing}
          />
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันหมดอายุ
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={expMonth}
                onChange={handleExpMonthChange}
                placeholder="MM"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center"
                disabled={loading || processing}
                maxLength={2}
              />
              <span className="text-2xl text-gray-400 self-center">/</span>
              <input
                type="text"
                value={expYear}
                onChange={handleExpYearChange}
                placeholder="YYYY"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center"
                disabled={loading || processing}
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={handleCvvChange}
              placeholder="123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center"
              disabled={loading || processing}
              maxLength={4}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
          <Lock className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">
            ข้อมูลบัตรของคุณปลอดภัยและเข้ารหัสด้วย SSL/TLS
            <br />
            เราไม่เก็บข้อมูลบัตรของคุณในระบบ
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || processing}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              กำลังตรวจสอบบัตร...
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              ยืนยันการชำระเงิน
            </>
          )}
        </button>
      </form>
    </div>
  );
}
