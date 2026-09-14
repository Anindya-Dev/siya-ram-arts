import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, MapPin, Plus } from 'lucide-react';
import { CartItem } from './CartDrawer';
import { fetchApi } from '../../lib/api';
import { Button } from '../ui/Button';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CheckoutResponse {
  order: { id: string; orderNumber: string; totalAmount: number };
  razorpay: { razorpayOrderId: string; amount: number; currency: string; receipt: string };
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const initialAddress = { fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', stateCode: '08', postalCode: '', country: 'India', isDefault: true };

async function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  getToken: () => Promise<string | null>;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, items, getToken, onClose, onSuccess }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState('');
  const [address, setAddress] = useState(initialAddress);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const data = await fetchApi<Address[]>('/auth/addresses', { token });
      setAddresses(data);
      setAddressId(data.find((item) => item.isDefault)?.id || data[0]?.id || '');
      setShowAddressForm(data.length === 0);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load saved delivery addresses.');
    }
  };

  useEffect(() => {
    if (isOpen) void loadAddresses();
  }, [isOpen]);

  const createAddress = async (): Promise<string | null> => {
    const token = await getToken();
    if (!token) return null;
    const created = await fetchApi<Address>('/auth/addresses', {
      method: 'POST', token, body: JSON.stringify(address),
    });
    setAddresses((previous) => [created, ...previous]);
    setAddressId(created.id);
    return created.id;
  };

  const verifyPayment = async (checkout: CheckoutResponse, payment: { razorpay_payment_id: string; razorpay_signature: string }) => {
    const token = await getToken();
    if (!token) throw new Error('Your session has expired. Please sign in again.');
    await fetchApi('/payments/verify', {
      method: 'POST', token, body: JSON.stringify({
        orderId: checkout.order.id,
        razorpayOrderId: checkout.razorpay.razorpayOrderId,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
      }),
    });
    onSuccess();
  };

  const startCheckout = async () => {
    setLoading(true); setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Please sign in to continue to secure checkout.');
      const shippingAddressId = addressId || (showAddressForm ? await createAddress() : null);
      if (!shippingAddressId) throw new Error('Please select or add a delivery address.');
      const checkout = await fetchApi<CheckoutResponse>('/orders/checkout', {
        method: 'POST', token, body: JSON.stringify({
          items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity, reservationId: item.reservedQuantity === item.quantity ? item.reservationId : undefined })),
          shippingAddressId,
        }),
      });
      if (checkout.razorpay.razorpayOrderId.startsWith('order_test_')) {
        await verifyPayment(checkout, { razorpay_payment_id: `pay_test_${Date.now()}`, razorpay_signature: 'test_signature' });
        return;
      }
      const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!key) throw new Error('Razorpay is not configured. Please contact Siya Ram Arts support.');
      if (!(await loadRazorpay()) || !window.Razorpay) throw new Error('Unable to load Razorpay checkout. Please check your connection and try again.');
      new window.Razorpay({
        key, amount: checkout.razorpay.amount, currency: checkout.razorpay.currency, name: 'Siya Ram Arts', description: `Order ${checkout.order.orderNumber}`, order_id: checkout.razorpay.razorpayOrderId,
        handler: (payment: { razorpay_payment_id: string; razorpay_signature: string }) => { void verifyPayment(checkout, payment).catch((requestError) => setError(requestError.message)); },
        modal: { ondismiss: () => setLoading(false) },
      }).open();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to begin secure checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"><div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#FFFDF5] shadow-xl p-6 space-y-5"><div><h2 className="font-serif text-2xl font-bold text-[#3A2D20]">Secure Checkout</h2><p className="text-xs text-[#5C5248] mt-1">Select a delivery address before opening Razorpay.</p></div>{error && <div className="p-3 flex gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}<div className="space-y-3"><div className="flex justify-between items-center"><h3 className="font-serif font-bold text-sm text-[#3A2D20]">Delivery Address</h3><button onClick={() => setShowAddressForm((value) => !value)} className="text-xs text-[#8B5A2B] inline-flex gap-1"><Plus className="w-3.5 h-3.5" /> Add address</button></div>{addresses.map((item) => <label key={item.id} className="flex gap-3 p-3 border rounded cursor-pointer"><input type="radio" checked={addressId === item.id} onChange={() => { setAddressId(item.id); setShowAddressForm(false); }} /><span className="text-xs text-[#5C5248]"><strong className="text-[#3A2D20]">{item.fullName}</strong> · {item.phone}<br />{item.addressLine1}{item.addressLine2 ? `, ${item.addressLine2}` : ''}, {item.city}, {item.state} – {item.postalCode}</span></label>)}{showAddressForm && <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border border-[#D4AF37]/30 rounded"><input required placeholder="Full name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} /><input required placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} /><input required className="sm:col-span-2" placeholder="Address line 1" value={address.addressLine1} onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })} /><input placeholder="Address line 2 (optional)" value={address.addressLine2} onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })} /><input required placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /><input required placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /><input required placeholder="State code" value={address.stateCode} onChange={(e) => setAddress({ ...address, stateCode: e.target.value })} /><input required placeholder="PIN code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} /></div>}</div><div className="flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="gold" disabled={loading || !items.length} onClick={() => void startCheckout()}>{loading ? 'Preparing secure payment…' : 'Continue to Razorpay'}</Button></div></div></div>;
};
