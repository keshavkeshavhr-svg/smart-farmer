import { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Truck, CheckCircle, QrCode, Copy, ExternalLink, IndianRupee, MapPin, Loader2, ChevronDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearCart } from '../store/slices/cartSlice';
import { addToast } from '../store/slices/uiSlice';
import { api } from '../lib/api';
import { indianStates, getDistrictsByState } from '../data/indianStatesDistricts';

interface UpiPaymentData {
  txnId: string;
  amount: number;
  qrCodeUrl: string;
  upiLink: string;
  upiId: string;
  merchantName: string;
  gstin: string;
  supportedApps: { name: string; icon: string; deepLink: string }[];
}

export default function Checkout() {
  const { items } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [upiData, setUpiData] = useState<UpiPaymentData | null>(null);
  const [copied, setCopied] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Shipping address form state
  const [shippingLine1, setShippingLine1] = useState(user?.address || '');
  const [shippingState, setShippingState] = useState(user?.state || '');
  const [shippingDistrict, setShippingDistrict] = useState(user?.district || '');
  const [shippingPincode, setShippingPincode] = useState(user?.pincode || '');

  // Get districts for the selected state
  const availableDistricts = useMemo(() => {
    if (!shippingState) return [];
    return getDistrictsByState(shippingState);
  }, [shippingState]);

  // Reset district when state changes
  const handleStateChange = (newState: string) => {
    setShippingState(newState);
    setShippingDistrict(''); // Reset district on state change
  };

  if (items.length === 0 && !successOrderId && !upiData) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated && !successOrderId) {
    return <Navigate to="/login" state={{ from: { pathname: '/checkout' } }} replace />;
  }

  const captureGps = () => {
    setGpsLoading(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsLoading(false);
        dispatch(addToast({ type: 'success', title: 'Location Captured', message: 'Delivery pin set precisely.' }));
      },
      (error) => {
        setGpsError(error.message);
        setGpsLoading(false);
        dispatch(addToast({ type: 'error', title: 'Location Error', message: 'Could not fetch your location.' }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return acc + (price * qty);
  }, 0);
  const gst = subtotal * 0.05; // 5% GST
  const shipping = subtotal > 5000 ? 0 : 150;
  const total = subtotal + gst + shipping;

  const handleInitiatePayment = async () => {
    setIsLoading(true);
    try {
      // 1. Create order
      const orderPayload = {
        items: items.map(i => ({
          type: i.type,
          cropId: i.type === 'CROP' ? i.id : undefined,
          productId: i.type === 'STORE' ? i.id : undefined,
          quantityKg: i.type === 'CROP' ? i.quantity : undefined,
          quantity: i.type === 'STORE' ? i.quantity : undefined,
        })),
        shippingAddress: {
          line1: shippingLine1 || user?.address || '123 Farm Road',
          district: shippingDistrict || user?.district || 'Bangalore',
          state: shippingState || user?.state || 'Karnataka',
          pincode: shippingPincode || user?.pincode || '560001',
        },
        shippingLat: gpsCoords?.lat ?? undefined,
        shippingLng: gpsCoords?.lng ?? undefined,
      };

      if (!shippingState || !shippingDistrict) {
        dispatch(addToast({ type: 'error', title: 'Missing Info', message: 'Please select your state and district before placing the order.' }));
        setIsLoading(false);
        return;
      }

      const orderData = await api.post('/orders', orderPayload) as any;
      const appOrderId = orderData.id;

      // 2. Create UPI payment
      const paymentData = await api.post('/payments/upi/create', { 
        amount: total, 
        orderId: appOrderId 
      }) as unknown as UpiPaymentData;

      setUpiData(paymentData);
    } catch (err: any) {
      dispatch(addToast({ type: 'error', title: 'Checkout Error', message: err.message || 'Failed to initiate checkout' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!upiData) return;
    setIsLoading(true);
    try {
      const result = await api.post('/payments/upi/confirm', { txnId: upiData.txnId }) as any;
      dispatch(clearCart());
      setSuccessOrderId(result.orderId || upiData.txnId);
      setUpiData(null);
      dispatch(addToast({ type: 'success', title: 'Payment Confirmed', message: 'Your order has been placed successfully!' }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to confirm payment' }));
    } finally {
      setIsLoading(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiData?.upiId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Success Screen ────────────────────────────────────────────────────────
  if (successOrderId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Thank you for your purchase. Your order #{successOrderId.substring(0, 8)} is being processed and will be delivered soon.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary px-8 py-3">
          Go to Dashboard
        </button>
      </div>
    );
  }

  // ─── UPI Payment Screen ────────────────────────────────────────────────────
  if (upiData) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <button onClick={() => setUpiData(null)} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Pay via UPI</h2>
                  <p className="text-indigo-100 text-sm mt-0.5">Scan QR or use any UPI app</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold">₹{upiData.amount.toFixed(2)}</p>
                  <p className="text-indigo-200 text-xs">incl. GST</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-inner mb-3">
                  <img src={upiData.qrCodeUrl} alt="UPI QR Code" className="w-64 h-64 rounded-lg" />
                </div>
                <p className="text-xs text-gray-500">Scan with any UPI app</p>
              </div>

              {/* UPI ID */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">UPI ID</p>
                <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
                  <span className="text-sm font-bold text-gray-900 font-mono">{upiData.upiId}</span>
                  <button onClick={copyUpiId} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Pay with Apps */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Pay with</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Google Pay', color: 'from-blue-500 to-blue-600', icon: '💳' },
                    { name: 'PhonePe', color: 'from-purple-500 to-purple-600', icon: '📱' },
                    { name: 'Paytm', color: 'from-sky-500 to-cyan-600', icon: '💰' },
                    { name: 'BHIM UPI', color: 'from-orange-500 to-amber-600', icon: '🏦' },
                  ].map((app) => (
                    <a 
                      key={app.name}
                      href={upiData.upiLink}
                      className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${app.color} text-white hover:opacity-90 transition-opacity shadow-sm`}
                    >
                      <span className="text-xl">{app.icon}</span>
                      <div>
                        <p className="text-sm font-bold">{app.name}</p>
                        <p className="text-[10px] opacity-80">Tap to pay</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60" />
                    </a>
                  ))}
                </div>
              </div>

              {/* GSTIN */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <IndianRupee className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">GSTIN: {upiData.gstin}</p>
                    <p className="text-xs text-amber-700 mt-0.5">Merchant: {upiData.merchantName}</p>
                    <p className="text-xs text-amber-600 mt-1">GST invoice will be generated after payment confirmation.</p>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmPayment}
                disabled={isLoading}
                className="w-full btn bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 text-base font-bold shadow-lg hover:from-green-700 hover:to-emerald-700 rounded-xl flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    I've Completed the Payment
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Click above after making the payment via your UPI app
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex flex-col gap-2 items-center text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-600" /> 100% Secure UPI Payments</span>
            <span className="text-center px-4 leading-relaxed">Payments are processed directly via NPCI UPI network. Your bank details stay with your bank.</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Cart Review Screen ────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Secure Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-medium text-gray-900">Order Items ({items.length})</h2>
              </div>
              <ul className="divide-y divide-gray-100 px-6 py-2">
                {items.map((item) => (
                  <li key={item.id} className="py-4 flex gap-4 items-center">
                    <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="w-16 h-16 rounded-md object-cover border border-gray-200" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.type === 'CROP' ? 'Farm Crop' : 'Store Product'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₹{((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {Number(item.quantity) || 0}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-medium text-gray-900">Delivery Information</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{user?.phone || user?.email}</p>
                </div>

                {/* Address Line */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address Line <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={shippingLine1}
                    onChange={(e) => setShippingLine1(e.target.value)}
                    placeholder="House no, Street name, Area..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>

                {/* State Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={shippingState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="">— Select State —</option>
                      {indianStates.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* District Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">District <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={shippingDistrict}
                      onChange={(e) => setShippingDistrict(e.target.value)}
                      disabled={!shippingState}
                      className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all cursor-pointer ${!shippingState ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-900'}`}
                    >
                      <option value="">{shippingState ? '— Select District —' : '— Select State First —'}</option>
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={shippingPincode}
                    onChange={(e) => setShippingPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                
                {/* GPS Capture Button */}
                <div className="border-t border-gray-100 pt-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    Exact Delivery Location Pin
                  </h3>
                  
                  {gpsCoords ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Location captured precisely
                    </div>
                  ) : (
                    <button
                      onClick={captureGps}
                      disabled={gpsLoading}
                      className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg text-sm flex items-center gap-2 justify-center transition-colors"
                    >
                      {gpsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                      ) : (
                        <MapPin className="w-4 h-4 text-primary-600" />
                      )}
                      {gpsLoading ? 'Detecting Location...' : 'Use My Current Location'}
                    </button>
                  )}
                  {gpsError && <p className="text-xs text-red-500 mt-2">{gpsError}</p>}
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-800 flex items-start gap-3">
                  <Truck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>Free delivery on orders above ₹5,000. Standard delivery: 2-3 business days.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="md:col-span-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Payment Details</h2>
              
              <dl className="space-y-4 text-sm text-gray-600 border-b border-gray-100 pb-6 mb-6">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>GST (5%)</dt>
                  <dd className="font-medium text-gray-900">₹{gst.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="flex items-center gap-2">Shipping {shipping === 0 && <span className="bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded text-xs">FREE</span>}</dt>
                  <dd className="font-medium text-gray-900">₹{shipping.toFixed(2)}</dd>
                </div>
              </dl>
              
              <div className="flex justify-between items-end mb-8">
                <p className="text-base font-semibold text-gray-900">Total</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">₹{total.toFixed(2)}</p>
              </div>

              <button
                onClick={handleInitiatePayment}
                disabled={isLoading}
                className="w-full btn bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 text-base font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 rounded-xl flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Pay with UPI
                  </>
                )}
              </button>

              {/* Payment Methods */}
              <div className="mt-5 flex items-center justify-center gap-4 text-xs text-gray-400">
                <span>💳 GPay</span>
                <span>📱 PhonePe</span>
                <span>💰 Paytm</span>
                <span>🏦 BHIM</span>
              </div>
              
              <div className="mt-6 flex flex-col gap-2 items-center justify-center text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-600" /> 100% Secure UPI Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
