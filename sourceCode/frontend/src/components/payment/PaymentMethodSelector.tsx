'use client';

import { CreditCard, QrCode, Smartphone, Building2, Wallet } from 'lucide-react';

export type PaymentMethodType = 'OMISE_CREDIT_CARD' | 'OMISE_PROMPTPAY' | 'OMISE_TRUEMONEY' | 'OMISE_INTERNET_BANKING' | 'COD';

interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'OMISE_CREDIT_CARD',
    name: 'บัตรเครดิต/เดบิต',
    description: 'Visa, Mastercard, JCB',
    icon: CreditCard,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'OMISE_PROMPTPAY',
    name: 'พร้อมเพย์',
    description: 'สแกน QR Code',
    icon: QrCode,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: 'OMISE_INTERNET_BANKING',
    name: 'Internet Banking',
    description: 'โอนผ่านธนาคาร',
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'OMISE_TRUEMONEY',
    name: 'TrueMoney Wallet',
    description: 'ชำระผ่าน TrueMoney',
    icon: Smartphone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'COD',
    name: 'เก็บเงินปลายทาง',
    description: 'ชำระเมื่อได้รับสินค้า',
    icon: Wallet,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
];

export default function PaymentMethodSelector({ selectedMethod, onSelectMethod }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">เลือกวิธีชำระเงิน</h3>

      {paymentMethods.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;

        return (
          <button
            key={method.id}
            onClick={() => onSelectMethod(method.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-100' : method.bgColor}`}>
                <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600' : method.color}`} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {method.name}
                  </h4>
                  {isSelected && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                      <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      เลือกแล้ว
                    </div>
                  )}
                </div>
                <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                  {method.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
