import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api';

export interface OmisePublicKeyResponse {
  publicKey: string;
}

export interface OmiseCreateChargeRequest {
  orderId: number;
  amount: number;
  currency?: string;
  paymentMethod: string;
  description?: string;
  token?: string; // For credit/debit card payments
  phoneNumber?: string; // For TrueMoney payments
  bankCode?: string; // For Internet Banking payments
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, string>;
  returnUrl?: string;
  webhookUrl?: string;
}

export interface OmiseChargeResponse {
  id: string;
  status: string; // 'pending', 'successful', 'failed'
  amount: number;
  currency: string;
  paid: boolean;
  created: string;
  authorize_uri?: string;
  requires_action?: boolean;
  source?: {
    type: string;
    scannable_code?: string; // For PromptPay QR code
  };
}

export interface OmiseCardTokenRequest {
  card: {
    number: string;
    name: string;
    expiration_month: number;
    expiration_year: number;
    security_code: string;
  };
}

export interface OmiseCardToken {
  id: string;
  object: string;
  livemode: boolean;
  location: string;
  used: boolean;
  created: string;
  card: {
    id: string;
    object: string;
    brand: string;
    country: string;
    fingerprint: string;
    last_digits: string;
    name: string;
    expiration_month: number;
    expiration_year: number;
    security_code_check: boolean;
  };
}

class OmiseApiService {
  private publicKey: string | null = null;

  // Get Omise public key from backend
  async getPublicKey(): Promise<string> {
    if (this.publicKey) {
      return this.publicKey;
    }

    try {
      const response = await axios.get<OmisePublicKeyResponse>(`${API_BASE}/payments/omise/public-key`);
      this.publicKey = response.data.publicKey;
      return this.publicKey;
    } catch (error) {
      console.error('Failed to get Omise public key:', error);
      throw new Error('Failed to initialize Omise');
    }
  }

  // Create card token using Omise.js
  async createCardToken(cardData: OmiseCardTokenRequest['card']): Promise<OmiseCardToken> {
    const publicKey = await this.getPublicKey();

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.Omise) {
        reject(new Error('Omise.js is not loaded'));
        return;
      }

      window.Omise.setPublicKey(publicKey);

      window.Omise.createToken('card', cardData, (statusCode: number, response: any) => {
        if (statusCode === 200) {
          resolve(response as OmiseCardToken);
        } else {
          reject(new Error(response.message || 'Failed to create card token'));
        }
      });
    });
  }

  // Get supported payment methods
  async getSupportedPaymentMethods(): Promise<string[]> {
    try {
      const response = await axios.get<string[]>(`${API_BASE}/payments/omise/payment-methods`);
      return response.data;
    } catch (error) {
      console.error('Failed to get supported payment methods:', error);
      throw new Error('Failed to get payment methods');
    }
  }

  // Create charge
  async createCharge(chargeData: OmiseCreateChargeRequest): Promise<OmiseChargeResponse> {
    try {
      const response = await axios.post<OmiseChargeResponse>(`${API_BASE}/payments/omise/charges`, chargeData);
      return response.data;
    } catch (error) {
      console.error('Failed to create Omise charge:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Payment processing failed');
      }
      throw new Error('Payment processing failed');
    }
  }

  // Get charge status
  async getCharge(chargeId: string): Promise<OmiseChargeResponse> {
    try {
      const response = await axios.get<OmiseChargeResponse>(`${API_BASE}/payments/omise/charges/${chargeId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get Omise charge:', error);
      throw new Error('Failed to get payment status');
    }
  }

  // Refund charge
  async refundCharge(chargeId: string, amount?: number, reason?: string): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (amount) params.append('amount', amount.toString());
      if (reason) params.append('reason', reason);

      await axios.post(`${API_BASE}/payments/omise/charges/${chargeId}/refund?${params}`);
    } catch (error) {
      console.error('Failed to refund Omise charge:', error);
      throw new Error('Failed to process refund');
    }
  }
}

// Create singleton instance
const omiseApiService = new OmiseApiService();

export default omiseApiService;

// Type for window.Omise
declare global {
  interface Window {
    Omise: {
      setPublicKey: (key: string) => void;
      createToken: (
        type: 'card',
        data: any,
        callback: (statusCode: number, response: any) => void
      ) => void;
    };
  }
}