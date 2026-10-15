import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// ── Status badge color map ──
const statusColors = {
  PENDING_PAYMENT: 'bg-yellow-500/15 text-yellow-400',
  PLACED: 'bg-blue-500/15 text-blue-400',
  CONFIRMED: 'bg-indigo-500/15 text-indigo-400',
  SHIPPED: 'bg-purple-500/15 text-purple-400',
  DELIVERED: 'bg-emerald-500/15 text-emerald-400'
};

const paymentColors = {
  PENDING: 'bg-yellow-500/15 text-yellow-400',
  PAID: 'bg-emerald-500/15 text-emerald-400',
  FAILED: 'bg-red-500/15 text-red-400'
};

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-slate-400 font-medium text-lg">Loading your orders...</p>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-center items-center py-20 px-4 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Unable to load orders</h2>
        <p className="text-slate-400 mb-6 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty State ──
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-center items-center py-20 px-4 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-3xl font-extrabold text-slate-100 mb-2">No orders yet</h2>
        <p className="text-slate-400 mb-8 text-base max-w-sm">
          You have not placed any orders yet. Start exploring our catalog!
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-105"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  // ── Orders List ──
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            📦 My Orders
            <span className="text-indigo-400 text-2xl font-semibold">({orders.length})</span>
          </h1>
          <p className="text-slate-400 mt-1">View and track all your purchases</p>
        </div>

        {/* Order Cards */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-slate-700 transition-all"
            >
              {/* Top row: Order ID + Date */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium">ORDER ID</p>
                  <p className="text-sm font-mono text-slate-300">{order._id}</p>
                </div>
                <p className="text-sm text-slate-400">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Items preview */}
              <div className="mb-4 space-y-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-8 h-8 rounded-md object-cover bg-slate-800 flex-shrink-0"
                      />
                    )}
                    <span className="text-sm text-slate-300">
                      {item.name} <span className="text-slate-500">× {item.quantity}</span>
                    </span>
                    <span className="text-sm text-slate-400 ml-auto">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom row: Total + Status + Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-extrabold text-indigo-400">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-slate-700 text-slate-300'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${paymentColors[order.paymentStatus] || 'bg-slate-700 text-slate-300'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="px-4 py-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 rounded-lg border border-indigo-900/50 transition-colors"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;
