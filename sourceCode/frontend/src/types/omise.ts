export interface OmiseCardData {
  number: string;
  name: string;
  expiration_month: number;
  expiration_year: number;
  security_code: string;
}

export interface OmisePaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'promptpay' | 'truemoney' | 'internet_banking';
  logo?: string;
  enabled: boolean;
}

export interface OmisePaymentFormData {
  paymentMethod: string;
  amount: number;
  currency: string;

  // Card payment fields
  cardNumber?: string;
  cardName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;

  // TrueMoney fields
  phoneNumber?: string;

  // Internet Banking fields
  bankCode?: string;

  // Customer info
  customerEmail?: string;
  customerName?: string;
}

export interface OmisePaymentResult {
  success: boolean;
  chargeId?: string;
  status?: string;
  authorizeUri?: string;
  qrCodeData?: string;
  error?: string;
  requiresAction?: boolean;
}

export interface OmiseBank {
  code: string;
  name: string;
  nameTh: string;
  logo?: string;
}

export const OMISE_BANKS: OmiseBank[] = [
  { code: 'bay', name: 'Bank of Ayudhya', nameTh: 'ธนาคารกรุงศรีอยุธยา' },
  { code: 'bbl', name: 'Bangkok Bank', nameTh: 'ธนาคารกรุงเทพ' },
  { code: 'ktb', name: 'Krung Thai Bank', nameTh: 'ธนาคารกรุงไทย' },
  { code: 'scb', name: 'Siam Commercial Bank', nameTh: 'ธนาคารไทยพาณิชย์' },
  { code: 'kbank', name: 'Kasikorn Bank', nameTh: 'ธนาคารกสิกรไทย' },
];

export const OMISE_PAYMENT_METHODS: OmisePaymentMethod[] = [
  {
    id: 'OMISE_CREDIT_CARD',
    name: 'บัตรเครดิต',
    type: 'credit_card',
    enabled: true
  },
  {
    id: 'OMISE_DEBIT_CARD',
    name: 'บัตรเดบิต',
    type: 'debit_card',
    enabled: true
  },
  {
    id: 'OMISE_PROMPTPAY',
    name: 'พร้อมเพย์',
    type: 'promptpay',
    enabled: true
  },
  {
    id: 'OMISE_TRUEMONEY',
    name: 'TrueMoney Wallet',
    type: 'truemoney',
    enabled: true
  },
  {
    id: 'OMISE_INTERNET_BANKING_BAY',
    name: 'ธนาคารกรุงศรีอยุธยา',
    type: 'internet_banking',
    enabled: true
  },
  {
    id: 'OMISE_INTERNET_BANKING_BBL',
    name: 'ธนาคารกรุงเทพ',
    type: 'internet_banking',
    enabled: true
  },
  {
    id: 'OMISE_INTERNET_BANKING_KTB',
    name: 'ธนาคารกรุงไทย',
    type: 'internet_banking',
    enabled: true
  },
  {
    id: 'OMISE_INTERNET_BANKING_SCB',
    name: 'ธนาคารไทยพาณิชย์',
    type: 'internet_banking',
    enabled: true
  },
  {
    id: 'OMISE_INTERNET_BANKING_KBANK',
    name: 'ธนาคารกสิกรไทย',
    type: 'internet_banking',
    enabled: true
  }
];