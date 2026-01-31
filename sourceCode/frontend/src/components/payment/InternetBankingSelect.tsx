'use client';

import { useState } from 'react';
import { Building2, ArrowRight, AlertCircle } from 'lucide-react';

interface Bank {
  code: string;
  name: string;
  fullName: string;
  color: string;
}

interface InternetBankingSelectProps {
  amount: number;
  orderId: number;
  onBankSelected: (bankCode: string) => void;
  loading?: boolean;
}

const banks: Bank[] = [
  {
    code: 'bay',
    name: 'KBank',
    fullName: 'ธนาคารกสิกรไทย',
    color: 'bg-emerald-600',
  },
  {
    code: 'bbl',
    name: 'Bangkok Bank',
    fullName: 'ธนาคารกรุงเทพ',
    color: 'bg-blue-700',
  },
  {
    code: 'ktb',
    name: 'KTB',
    fullName: 'ธนาคารกรุงไทย',
    color: 'bg-sky-500',
  },
  {
    code: 'scb',
    name: 'SCB',
    fullName: 'ธนาคารไทยพาณิชย์',
    color: 'bg-purple-700',
  },
  {
    code: 'kbank',
    name: 'Kasikorn',
    fullName: 'ธนาคารกสิกรไทย',
    color: 'bg-green-600',
  },
];

export default function InternetBankingSelect({ amount, orderId, onBankSelected, loading }: InternetBankingSelectProps) {
  const [selectedBank, setSelectedBank] = useState<string>('');

  const handleBankSelect = (bankCode: string) => {
    setSelectedBank(bankCode);
  };

  const handleSubmit = () => {
    if (selectedBank) {
      onBankSelected(selectedBank);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Building2 className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Internet Banking</h3>
          <p className="text-sm text-gray-500">เลือกธนาคารที่ต้องการชำระเงิน</p>
        </div>
      </div>

      {/* Amount Display */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600 text-center mb-1">ยอดชำระทั้งหมด</p>
        <p className="text-3xl font-bold text-gray-900 text-center">฿{amount.toLocaleString()}</p>
      </div>

      {/* Bank Selection */}
      <div className="space-y-3 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">เลือกธนาคาร</p>

        {banks.map((bank) => (
          <button
            key={bank.code}
            onClick={() => handleBankSelect(bank.code)}
            disabled={loading}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
              selectedBank === bank.code
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${bank.color} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                {bank.name.substring(0, 3).toUpperCase()}
              </div>
              <div className="text-left">
                <h4 className={`font-semibold ${selectedBank === bank.code ? 'text-purple-900' : 'text-gray-900'}`}>
                  {bank.name}
                </h4>
                <p className={`text-sm ${selectedBank === bank.code ? 'text-purple-700' : 'text-gray-500'}`}>
                  {bank.fullName}
                </p>
              </div>
            </div>

            {selectedBank === bank.code && (
              <div className="flex items-center gap-2 text-purple-600">
                <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">หมายเหตุ:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>กรุณาเตรียม User ID และ Password Internet Banking</li>
            <li>คุณจะถูกนำไปยังหน้าเว็บธนาคารเพื่อทำรายการ</li>
            <li>โปรดทำรายการให้เสร็จภายใน 15 นาที</li>
          </ul>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedBank || loading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            กำลังดำเนินการ...
          </>
        ) : (
          <>
            ดำเนินการชำระเงิน
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      {!selectedBank && (
        <p className="text-center text-sm text-gray-500 mt-3">
          กรุณาเลือกธนาคารเพื่อดำเนินการต่อ
        </p>
      )}
    </div>
  );
}
