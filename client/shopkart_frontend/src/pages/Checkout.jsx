import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

// ── Helper: Load Razorpay Checkout Script ──
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, totalCount, clearCart } = useCart();

  // ── Shipping form state ──
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [paymentFailed, setPaymentFailed] = useState('');

  // ── Redirect if cart is empty ──
  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // ── Handle input change ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ── Client-side validation (Task 3) ──
  const validateForm = () => {
    const newErrors = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      newErrors.phone = 'Phone must be a valid 10-digit number';
    }

    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!shippingAddress.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Place Order: Creates payment order → Opens Razorpay → Verifies ──
  const handlePlaceOrder = async () => {
    setServerError('');
    setPaymentFailed('');

    // Don't call backend if client validation fails
    if (!validateForm()) return;

    setLoading(true);

    try {
      // ── Step 1: Create payment order on backend ──
      const { data } = await api.post('/orders/create-payment-order', {
        shippingAddress
      });

      // ── Step 2: Load Razorpay script ──
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setServerError('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      // ── Step 3: Open Razorpay Checkout ──
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ShopKart',
        description: 'ShopKart Order',
        order_id: data.razorpayOrderId,

        handler: async function (response) {
          // ── Step 4: Verify payment on backend ──
          try {
            const verifyRes = await api.post('/orders/verify-payment', {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              // Clear frontend cart state → Navbar becomes Cart (0)
              clearCart();
              // Navigate to success page
              navigate(`/order-success/${data.shopKartOrderId}`);
            }
          } catch (err) {
            setServerError(
              err.response?.data?.message || 'Payment verification failed. Please contact support.'
            );
            setLoading(false);
          }
        },

        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone
        },

        theme: {
          color: '#4f46e5'
        },

        modal: {
          ondismiss: function () {
            setPaymentFailed('Payment was cancelled. Your cart has not been cleared. You can try again.');
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        setPaymentFailed(
          response.error?.description || 'Payment failed. Your cart has not been cleared. Please try again.'
        );
        setLoading(false);
      });

      paymentObject.open();
      // Don't set loading false here — Razorpay modal is open
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create order. Please try again.');
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight">
            Checkout
          </h1>
          <p className="text-slate-400 mt-1">Complete your shipping details and place your order</p>
        </div>

        {/* Server/Payment Error Banners */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm">
            ⚠️ {serverError}
          </div>
        )}
        {paymentFailed && (
          <div className="mb-6 p-4 rounded-xl bg-orange-950/50 border border-orange-800 text-orange-300 text-sm">
            ❌ {paymentFailed}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Shipping Details Form (left) ── */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-100 mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
                📦 Shipping Details
              </h2>

              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border ${
                      errors.fullName ? 'border-red-500' : 'border-slate-700'
                    } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
                  />
                  {errors.fullName && (
                    <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border ${
                      errors.phone ? 'border-red-500' : 'border-slate-700'
                    } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Address Line */}
                <div>
                  <label htmlFor="addressLine1" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="addressLine1"
                    type="text"
                    name="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={handleChange}
                    placeholder="Street address, flat number"
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border ${
                      errors.addressLine1 ? 'border-red-500' : 'border-slate-700'
                    } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
                  />
                  {errors.addressLine1 && (
                    <p className="text-red-400 text-xs mt-1">{errors.addressLine1}</p>
                  )}
                </div>

                {/* City + State row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-slate-300 mb-1.5">
                      City <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleChange}
                      placeholder="City"
                      className={`w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border ${
                        errors.city ? 'border-red-500' : 'border-slate-700'
                      } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
                    />
                    {errors.city && (
                      <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-slate-300 mb-1.5">
                      State <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="state"
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleChange}
                      placeholder="State"
                      className={`w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border ${
                        errors.state ? 'border-red-500' : 'border-slate-700'
                      } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
                    />
                    {errors.state && (
                      <p className="text-red-400 text-xs mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label htmlFor="pincode" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Pincode <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border ${
                      errors.pincode ? 'border-red-500' : 'border-slate-700'
                    } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
                  />
                  {errors.pincode && (
                    <p className="text-red-400 text-xs mt-1">{errors.pincode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Order Summary (right) ── */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-extrabold text-slate-100 mb-5 border-b border-slate-800 pb-3">
                🧾 Order Summary
              </h2>

              {/* Item list */}
              <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const product = item.product;
                  if (!product) return null;
                  return (
                    <div
                      key={product._id}
                      className="flex items-center justify-between gap-3 py-2 border-b border-slate-800/60 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400">× {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-200 flex-shrink-0">
                        ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Total Units:</span>
                  <span className="text-slate-200 font-semibold">{totalCount || 0}</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-200">Total:</span>
                  <span className="text-2xl font-extrabold text-indigo-400">
                    ₹{(subtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                id="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95 text-center flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </>
                ) : (
                  <>💳 Pay & Place Order</>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center mt-3">
                Secure payment powered by Razorpay (Test Mode)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
