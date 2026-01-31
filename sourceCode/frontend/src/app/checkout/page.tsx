'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Package,
  Truck,
  AlertCircle,
  Loader2,
  Home,
  Building2,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import {
  PaymentMethodSelector,
  PaymentMethodType,
  CreditCardForm,
  PromptPayQR,
  TrueMoneyWallet,
  InternetBankingSelect,
} from '@/components/payment';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  shopId: number;
  shopName: string;
  variantOptions?: Record<string, string>;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface SavedAddress {
  id: number;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Thailand',
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD');
  const [paymentToken, setPaymentToken] = useState<string>('');
  const [orderId, setOrderId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchCart();
      fetchSavedAddresses();
      // Pre-fill user data if available
      if (user) {
        setShippingAddress(prev => ({
          ...prev,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          email: user.email || '',
        }));
      }
    }
  }, [isAuthenticated, authLoading, router, user]);

  // Reset orderId when payment method changes (prevent reusing order from different payment method)
  useEffect(() => {
    if (orderId) {
      setOrderId(undefined);
    }
  }, [paymentMethod]);

  const getImageUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      return `http://localhost:8080/api${url}`;
    }
    return url;
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      const items = response.data.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        shopId: item.shopId,
        shopName: item.shopName || 'ร้านค้า',
        variantOptions: item.variantOptions,
      })) || [];

      if (items.length === 0) {
        router.push('/cart');
        return;
      }

      setCartItems(items);
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
      setError('ไม่สามารถโหลดตะกร้าสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const response = await api.get<SavedAddress[]>('/addresses');
      setSavedAddresses(response.data);

      // Auto-select default address if exists
      const defaultAddr = response.data.find(addr => addr.isDefault);
      if (defaultAddr) {
        handleSelectAddress(defaultAddr);
      }
    } catch (err) {
      console.error('Failed to fetch saved addresses:', err);
    }
  };

  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setShippingAddress({
      fullName: address.recipientName,
      phone: address.phone,
      email: user?.email || shippingAddress.email,
      addressLine1: address.line1,
      addressLine2: address.line2 || '',
      city: address.district || '',
      province: address.province || '',
      postalCode: address.postalCode || '',
      country: address.country,
    });
    setShowSavedAddresses(false);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 500 ? 0 : 50; // Free shipping for orders >= 500
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const validateStep1 = () => {
    const { fullName, phone, email, addressLine1, city, province, postalCode } = shippingAddress;

    if (!fullName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล');
      return false;
    }
    if (!phone.trim() || !/^[0-9]{9,10}$/.test(phone.replace(/-/g, ''))) {
      setError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)');
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('กรุณากรอกอีเมลให้ถูกต้อง');
      return false;
    }
    if (!addressLine1.trim()) {
      setError('กรุณากรอกที่อยู่');
      return false;
    }
    if (!city.trim()) {
      setError('กรุณากรอกเขต/อำเภอ');
      return false;
    }
    if (!province.trim()) {
      setError('กรุณากรอกจังหวัด');
      return false;
    }
    if (!postalCode.trim() || !/^[0-9]{5}$/.test(postalCode)) {
      setError('กรุณากรอกรหัสไปรษณีย์ให้ถูกต้อง (5 หลัก)');
      return false;
    }

    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // COD Order Flow
  const handleCODCheckout = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const checkoutData = {
        shippingAddressJson: JSON.stringify(shippingAddress),
        billingAddressJson: JSON.stringify(shippingAddress),
        shippingFee: calculateShipping(),
        taxAmount: 0,
        notes: notes.trim() || undefined,
      };

      const response = await api.post('/orders/checkout', checkoutData);
      router.push(`/orders/${response.data.id}?success=true`);
    } catch (err: any) {
      console.error('Failed to place order:', err);
      setError(err.response?.data?.message || err.response?.data || 'ไม่สามารถสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง');
      setSubmitting(false);
    }
  };

  // Credit Card Payment Flow (with token from Omise.js)
  const handleCreditCardPayment = async (token: string) => {
    try {
      setSubmitting(true);
      setError('');

      // 1. Create order first
      const checkoutData = {
        shippingAddressJson: JSON.stringify(shippingAddress),
        billingAddressJson: JSON.stringify(shippingAddress),
        shippingFee: calculateShipping(),
        taxAmount: 0,
        notes: notes.trim() || undefined,
      };

      const orderResponse = await api.post('/orders/checkout', checkoutData);
      const createdOrderId = orderResponse.data.id;

      // 2. Create payment charge with token
      const chargeResponse = await api.post('/payments/omise/charges', {
        amount: calculateTotal(),
        currency: 'THB',
        paymentMethod: 'OMISE_CREDIT_CARD',
        orderId: createdOrderId,
        token: token,
        description: `Order #${createdOrderId}`,
      });

      // 3. Check if payment successful
      if (chargeResponse.data.paid) {
        router.push(`/orders/${createdOrderId}?success=true`);
      } else if (chargeResponse.data.authorize_uri) {
        // 3D Secure - redirect to bank
        window.location.href = chargeResponse.data.authorize_uri;
      } else {
        throw new Error('การชำระเงินไม่สำเร็จ');
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      setError(err.response?.data?.message || 'การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      setSubmitting(false);
    }
  };

  // PromptPay Flow
  const handlePromptPayCheckout = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Create order first
      const checkoutData = {
        shippingAddressJson: JSON.stringify(shippingAddress),
        billingAddressJson: JSON.stringify(shippingAddress),
        shippingFee: calculateShipping(),
        taxAmount: 0,
        notes: notes.trim() || undefined,
      };

      const orderResponse = await api.post('/orders/checkout', checkoutData);
      const createdOrderId = orderResponse.data.id;

      // Set orderId and go back to step 2 to show PromptPayQR component
      setOrderId(createdOrderId);
      setCurrentStep(2);
      setSubmitting(false);
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setError(err.response?.data?.message || 'ไม่สามารถสร้างคำสั่งซื้อได้');
      setSubmitting(false);
    }
  };

  // Internet Banking Flow - Create order first, then create charge
  const handleInternetBanking = async (bankCode: string) => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // 1. Create order first (if not already created)
      let createdOrderId = orderId;
      if (!createdOrderId) {
        const checkoutData = {
          shippingAddressJson: JSON.stringify(shippingAddress),
          billingAddressJson: JSON.stringify(shippingAddress),
          shippingFee: calculateShipping(),
          taxAmount: 0,
          notes: notes.trim() || undefined,
        };

        const orderResponse = await api.post('/orders/checkout', checkoutData);
        createdOrderId = orderResponse.data.id;
        setOrderId(createdOrderId);
      }

      // 2. Create charge with bank code
      const chargeResponse = await api.post('/payments/omise/charges', {
        amount: calculateTotal(),
        currency: 'THB',
        paymentMethod: 'OMISE_INTERNET_BANKING_' + bankCode.toUpperCase(),
        orderId: createdOrderId,
        bankCode: bankCode,
        description: `Order #${createdOrderId}`,
      });

      // 3. Redirect to bank
      if (chargeResponse.data.authorize_uri) {
        window.location.href = chargeResponse.data.authorize_uri;
      } else {
        throw new Error('ไม่สามารถเชื่อมต่อกับธนาคารได้');
      }
    } catch (err: any) {
      console.error('Failed to initiate banking payment:', err);
      setError(err.response?.data?.message || err.response?.data || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setSubmitting(false);
    }
  };

  // TrueMoney Wallet Flow - Create order when user submits phone number
  const handleTrueMoneyPhoneSubmit = async (phoneNumber: string) => {
    if (!validateStep1()) {
      setCurrentStep(1);
      throw new Error('กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วน');
    }

    try {
      setSubmitting(true);
      setError('');

      // Create order first
      const checkoutData = {
        shippingAddressJson: JSON.stringify(shippingAddress),
        billingAddressJson: JSON.stringify(shippingAddress),
        shippingFee: calculateShipping(),
        taxAmount: 0,
        notes: notes.trim() || undefined,
      };

      const orderResponse = await api.post('/orders/checkout', checkoutData);
      const createdOrderId = orderResponse.data.id;

      // Set orderId so TrueMoney component can create charge
      setOrderId(createdOrderId);
      
      // Now TrueMoney component will automatically create charge with the orderId
    } catch (err: any) {
      console.error('Failed to create order:', err);
      const errorMessage = err.response?.data?.message || 'ไม่สามารถสร้างคำสั่งซื้อได้';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Main order placement handler
  const handlePlaceOrder = async () => {
    if (paymentMethod === 'COD') {
      await handleCODCheckout();
    } else if (paymentMethod === 'OMISE_PROMPTPAY') {
      await handlePromptPayCheckout();
    }
    // TrueMoney: Order will be created when user submits phone number
    // Internet Banking: No need to create order here, it will be created when bank is selected
    // Credit card is handled directly by CreditCardForm callback
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'ที่อยู่จัดส่ง', icon: MapPin },
    { number: 2, title: 'ชำระเงิน', icon: CreditCard },
    { number: 3, title: 'ตรวจสอบคำสั่งซื้อ', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            กลับไปที่ตะกร้า
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">ชำระเงิน</h1>
          <p className="text-gray-600">{cartItems.length} รายการในตะกร้า</p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-200 -z-0">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : (
                      <Icon className="h-8 w-8" />
                    )}
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-700">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">ที่อยู่จัดส่ง</h2>
                  </div>
                  {savedAddresses.length > 0 && (
                    <button
                      onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                    >
                      <MapPin className="h-4 w-4" />
                      {showSavedAddresses ? 'ซ่อนที่อยู่ที่บันทึกไว้' : 'เลือกที่อยู่ที่บันทึกไว้'}
                    </button>
                  )}
                </div>

                {/* Saved Addresses List */}
                {showSavedAddresses && savedAddresses.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">ที่อยู่ที่บันทึกไว้</h3>
                      <a
                        href="/settings?tab=addresses"
                        target="_blank"
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        จัดการที่อยู่
                      </a>
                    </div>
                    <div className="grid gap-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                            selectedAddressId === addr.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900">{addr.recipientName}</p>
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                    ค่าเริ่มต้น
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{addr.phone}</p>
                              <p className="text-sm text-gray-700 mt-1">
                                {addr.line1}
                                {addr.line2 && ` ${addr.line2}`}
                                {addr.district && ` ${addr.district}`}
                                {addr.province && ` ${addr.province}`}
                                {addr.postalCode && ` ${addr.postalCode}`}
                              </p>
                            </div>
                            {selectedAddressId === addr.id && (
                              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ-นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="นาย/นาง ชื่อ นามสกุล"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0812345678"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {/* Address Line 1 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ที่อยู่ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={shippingAddress.addressLine1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="บ้านเลขที่ ซอย ถนน"
                      />
                    </div>
                  </div>

                  {/* Address Line 2 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ที่อยู่เพิ่มเติม (ไม่บังคับ)
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={shippingAddress.addressLine2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="อาคาร คอนโด หมู่บ้าน"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เขต/อำเภอ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="เขต/อำเภอ"
                    />
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      จังหวัด <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.province}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="จังหวัด"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสไปรษณีย์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10110"
                      maxLength={5}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ประเทศ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Thailand">ประเทศไทย</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <PaymentMethodSelector
                    selectedMethod={paymentMethod}
                    onSelectMethod={setPaymentMethod}
                  />

                  {/* Order Notes */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หมายเหตุการสั่งซื้อ (ไม่บังคับ)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="ข้อความถึงผู้ขาย (เช่น สีที่ต้องการ, เวลาจัดส่ง)"
                    />
                  </div>
                </div>

                {/* Payment Forms based on selected method */}
                {paymentMethod === 'OMISE_CREDIT_CARD' && (
                  <CreditCardForm
                    onTokenCreated={handleCreditCardPayment}
                    loading={submitting}
                  />
                )}

                {paymentMethod === 'OMISE_PROMPTPAY' && orderId && (
                  <PromptPayQR
                    amount={calculateTotal()}
                    orderId={orderId}
                    onPaymentComplete={() => {
                      router.push(`/orders/${orderId}?success=true`);
                    }}
                    onPaymentFailed={(error) => {
                      setError(error);
                    }}
                  />
                )}

                {paymentMethod === 'OMISE_TRUEMONEY' && (
                  <TrueMoneyWallet
                    amount={calculateTotal()}
                    orderId={orderId}
                    onPhoneNumberSubmit={handleTrueMoneyPhoneSubmit}
                    onPaymentComplete={() => {
                      if (orderId) {
                        router.push(`/orders/${orderId}?success=true`);
                      }
                    }}
                    onPaymentFailed={(error) => {
                      setError(error);
                    }}
                  />
                )}

                {paymentMethod === 'OMISE_INTERNET_BANKING' && (
                  <InternetBankingSelect
                    amount={calculateTotal()}
                    orderId={orderId || 0}
                    onBankSelected={handleInternetBanking}
                    loading={submitting}
                  />
                )}
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Shipping Address Review */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">ที่อยู่จัดส่ง</h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      แก้ไข
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-900">{shippingAddress.fullName}</p>
                    <p>{shippingAddress.addressLine1}</p>
                    {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                    <p>
                      {shippingAddress.city} {shippingAddress.province} {shippingAddress.postalCode}
                    </p>
                    <p>{shippingAddress.country}</p>
                    <p className="pt-2">โทร: {shippingAddress.phone}</p>
                    <p>อีเมล: {shippingAddress.email}</p>
                  </div>
                </div>

                {/* Payment Method Review */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">วิธีชำระเงิน</h3>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      แก้ไข
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {paymentMethod === 'COD' && (
                      <>
                        <Package className="h-5 w-5" />
                        <span>เก็บเงินปลายทาง (COD)</span>
                      </>
                    )}
                    {paymentMethod === 'OMISE_CREDIT_CARD' && (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>บัตรเครดิต/เดบิต</span>
                      </>
                    )}
                    {paymentMethod === 'OMISE_PROMPTPAY' && (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>พร้อมเพย์</span>
                      </>
                    )}
                    {paymentMethod === 'OMISE_INTERNET_BANKING' && (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>Internet Banking</span>
                      </>
                    )}
                    {paymentMethod === 'OMISE_TRUEMONEY' && (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>TrueMoney Wallet</span>
                      </>
                    )}
                  </div>
                  {notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">หมายเหตุ:</p>
                      <p className="text-sm text-gray-700">{notes}</p>
                    </div>
                  )}
                </div>

                {/* Order Items Review */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">รายการสินค้า</h3>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.productImage ? (
                            <img
                              src={getImageUrl(item.productImage)}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 line-clamp-2">{item.productName}</h4>
                          <p className="text-sm text-gray-500">{item.shopName}</p>
                          {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.variantOptions).map(([key, value]) => (
                                <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {value}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm text-gray-600">จำนวน: {item.quantity}</span>
                            <span className="font-semibold text-gray-900">
                              ฿{(item.unitPrice * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <ArrowLeft className="h-5 w-5" />
                  ย้อนกลับ
                </button>
              )}

              {currentStep < 3 ? (
                <>
                  {/* Hide Next button in specific cases:
                      1. PromptPay: Order created, waiting for payment (has orderId)
                      2. TrueMoney: Always show form in step 2, no next button
                      3. Internet Banking: User must select bank, not go to step 3 */}
                  {!(
                    (paymentMethod === 'OMISE_PROMPTPAY' && orderId) ||
                    paymentMethod === 'OMISE_TRUEMONEY' ||
                    paymentMethod === 'OMISE_INTERNET_BANKING'
                  ) && (
                    <button
                      onClick={handleNextStep}
                      className="ml-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                    >
                      ถัดไป
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Show submit button only for COD and PromptPay (not created yet)
                      TrueMoney: Has form in step 2, no submit button in step 3
                      Internet Banking: No submit button, user selects bank directly in step 2 */}
                  {!(
                    (paymentMethod === 'OMISE_PROMPTPAY' && orderId)
                  ) && 
                  paymentMethod !== 'OMISE_TRUEMONEY' &&
                  paymentMethod !== 'OMISE_INTERNET_BANKING' && (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={submitting}
                      className="ml-auto flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          กำลังดำเนินการ...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          ยืนยันคำสั่งซื้อ
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">สรุปคำสั่งซื้อ</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>ยอดรวมสินค้า ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น)</span>
                  <span className="font-semibold">฿{calculateSubtotal().toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>ค่าจัดส่ง</span>
                  {calculateShipping() === 0 ? (
                    <span className="text-green-600 font-semibold">ฟรี</span>
                  ) : (
                    <span className="font-semibold">฿{calculateShipping().toLocaleString()}</span>
                  )}
                </div>

                {calculateSubtotal() < 500 && (
                  <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                    💡 ซื้อเพิ่ม ฿{(500 - calculateSubtotal()).toLocaleString()} เพื่อรับส่งฟรี!
                  </div>
                )}

                <hr className="border-gray-200" />

                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>ยอดรวมทั้งหมด</span>
                  <span className="text-blue-600">฿{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span>ชำระเงินปลอดภัย</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>จัดส่งฟรีเมื่อซื้อครบ ฿500</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <span>รับประกันคืนเงิน 30 วัน</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
