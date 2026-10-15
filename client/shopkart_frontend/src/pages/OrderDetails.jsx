import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// ── Status progression tracker ──
const statusSteps = ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const statusLabels = {
  PENDING_PAYMENT: 'Pending Payment',
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
};

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-slate-400 font-medium text-lg">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-center items-center py-20 px-4 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Order not found</h2>
        <p className="text-slate-400 mb-6 max-w-md">{error}</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
        >
          ← Back to My Orders
        </button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate('/orders')}
          className="text-sm text-slate-400 hover:text-indigo-400 mb-6 inline-flex items-center gap-1 transition-colors"
        >
          ← Back to My Orders
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Order Details</h1>
          <p className="text-slate-500 text-sm font-mono mt-1">ID: {order._id}</p>
          <p className="text-slate-400 text-sm mt-1">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Status Tracker — Bonus visual progression */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-100 mb-4">Order Status</h2>
          <div className="flex items-center justify-between gap-1">
            {statusSteps.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="flex-1 flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    } ${isCurrent ? 'ring-2 ring-indigo-400/50 scale-110' : ''}`}
                  >
                    {isActive ? '✓' : idx + 1}
                  </div>
                  <p
                    className={`text-[10px] sm:text-xs mt-1.5 font-medium ${
                      isActive ? 'text-indigo-400' : 'text-slate-600'
                    }`}
                  >
                    {statusLabels[step]}
                  </p>
                  {/* Connector line */}
                  {idx < statusSteps.length - 1 && (
                    <div
                      className={`hidden sm:block absolute h-0.5 w-full ${
                        idx < currentStepIndex ? 'bg-indigo-500' : 'bg-slate-700'
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Items Ordered</h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 py-2 border-b border-slate-800/60 last:border-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                    />
                  )}
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-extrabold text-slate-200">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 mt-4 pt-4 flex justify-between items-center">
              <span className="text-base font-bold text-slate-200">Total</span>
              <span className="text-xl font-extrabold text-indigo-400">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Shipping + Payment Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-100 mb-4">📦 Shipping Address</h2>
              <div className="text-sm text-slate-300 space-y-1">
                <p className="font-semibold text-slate-200">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                </p>
                <p className="text-slate-400">📞 {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-100 mb-4">💳 Payment Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : order.paymentStatus === 'FAILED'
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-yellow-500/15 text-yellow-400'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                {order.razorpayOrderId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Razorpay Order</span>
                    <span className="text-slate-300 font-mono text-xs">{order.razorpayOrderId}</span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment ID</span>
                    <span className="text-slate-300 font-mono text-xs">{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
