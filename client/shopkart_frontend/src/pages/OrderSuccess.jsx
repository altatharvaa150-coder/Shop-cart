import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function OrderSuccess() {
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
        <h2 className="text-2xl font-bold text-red-400 mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6 max-w-md">{error}</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
        >
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg text-center">
        {/* Success icon with animation */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500 animate-bounce">
            <span className="text-4xl">✅</span>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-slate-400 mb-8">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        {/* Order details card */}
        <div className="bg-slate-800/50 rounded-xl p-5 mb-8 text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Order ID</span>
            <span className="text-sm font-mono text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
              {order._id}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Total Amount</span>
            <span className="text-lg font-extrabold text-indigo-400">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Payment Status</span>
            <span className="text-sm font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full">
              {order.paymentStatus}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Order Status</span>
            <span className="text-sm font-bold text-blue-400 bg-blue-500/15 px-3 py-1 rounded-full">
              {order.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Items</span>
            <span className="text-sm text-slate-300">{order.items.length} product(s)</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95"
          >
            📦 View My Orders
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all duration-200 active:scale-95"
          >
            🛍️ Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
