import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Cart() {
  const navigate = useNavigate();


  const { 
    cart, 
    loading, 
    error, 
    totalCount, 
    subtotal, 
    updateQuantity, 
    removeFromCart, 
    fetchCart 
  } = useCart();

  // State to track which item is currently updating/loading
  const [updatingId, setUpdatingId] = useState(null);

  
  const handleQuantityChange = async (productId, currentQuantity, change, stock) => {
    const newqty = currentQuantity + change;
    if(newqty<1|| newqty>stock) return;
    setUpdatingId(productId);
    await updateQuantity(productId, newqty);
    setUpdatingId(null);
    
  };


  const handleRemove = async (productId) => {
   setUpdatingId(productId)
   await removeFromCart(productId)
   setUpdatingId(null)
    
  };


  if (loading && (!cart || cart.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-slate-400 font-medium text-lg">Loading your cart...</p>
      </div>
    );
  }

  // State B: Error State
  if (error && (!cart || cart.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-center items-center py-20 px-4 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Unable to load your cart.</h2>
        <p className="text-slate-400 mb-6 max-w-md">{error}</p>
        <button
          onClick={fetchCart}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  // State C: Empty Cart State
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-center items-center py-20 px-4 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-3xl font-extrabold text-slate-100 mb-2">Your cart is empty</h2>
        <p className="text-slate-400 mb-8 text-base max-w-sm">
          Looks like you haven't added anything yet. Start exploring our catalog!
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-105"
        >
          Browse Products
        </button>
      </div>
    );
  }

  // State D: Full Cart List + Order Summary
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            My Cart <span className="text-indigo-400 text-2xl font-semibold">({totalCount || 0} units)</span>
          </h1>
          <p className="text-slate-400 mt-1">Review your items before proceeding to checkout</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const product = item.product;
              if (!product) return null;

              const isItemUpdating = updatingId === product._id;
              const isMaxStock = item.quantity >= product.stock;
              const isMinQty = item.quantity <= 1;

              return (
                <div
                  key={product._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 shadow-sm hover:border-slate-700 transition-all"
                >
                  {/* Product Thumbnail */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                  />

                  {/* Product Details */}
                  <div className="flex-grow text-center sm:text-left w-full sm:w-auto">
                    <h3 className="text-lg font-bold text-slate-100 mb-1">{product.name}</h3>
                    <p className="text-indigo-400 font-extrabold text-base mb-1">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-400">
                      Available Stock: <span className="text-slate-300 font-medium">{product.stock}</span>
                    </p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col sm:items-end items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                    {/* Item Subtotal: price * quantity */}
                    <p className="text-xl font-extrabold text-slate-100">
                      ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                    </p>

                    <div className="flex items-center gap-3">
                      {/* [-] [n] [+] Quantity Controls */}
                      <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(product._id, item.quantity, -1, product.stock)}
                          disabled={isMinQty || isItemUpdating}
                          className="w-9 h-9 flex items-center justify-center text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-transparent font-bold transition-colors"
                          title="Decrease Quantity"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-slate-100 text-sm">
                          {isItemUpdating ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(product._id, item.quantity, 1, product.stock)}
                          disabled={isMaxStock || isItemUpdating}
                          className="w-9 h-9 flex items-center justify-center text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-transparent font-bold transition-colors"
                          title={isMaxStock ? 'Stock limit reached' : 'Increase Quantity'}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(product._id)}
                        disabled={isItemUpdating}
                        className="px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg border border-red-900/50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    {isMaxStock && (
                      <p className="text-[11px] text-orange-400 font-medium">Max available stock reached</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-extrabold text-slate-100 mb-5 border-b border-slate-800 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Total Units:</span>
                  <span className="text-slate-200 font-semibold">{totalCount || 0}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Unique Items:</span>
                  <span className="text-slate-200 font-semibold">{cart.length}</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-200">Subtotal:</span>
                  <span className="text-2xl font-extrabold text-indigo-400">
                    ₹{(subtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95 text-center"
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
