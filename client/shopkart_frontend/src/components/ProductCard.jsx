import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';


function ProductCard({ product, initialWishlisted = false, onWishlistChange }) {
  const isOutOfStock = product.stock === 0;
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [error, setError] = useState(null);

  const isInCart = cart?.some((item) => (item.product?._id || item.product) === product._id);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAddingToCart(true);
    setError(null);
    const res = await addToCart(product._id);
    if (!res.success) {
      setError(res.message);
    }
    setIsAddingToCart(false);
  };

const handleWishlist=async(e) =>{
  e.stopPropagation();// if clicked it wont select all the children pages and all ?!
  setIsSaving(true);
  setError(null)

  try {
      if (isWishlisted) {
        // 1. If currently wishlisted, remove it
        await api.delete(`/customers/wishlist/${product._id}`);
        setIsWishlisted(false); 
        onWishlistChange?.(product._id, false);
      }else{
        await api.post(`/customers/wishlist/${product._id}`);
        setIsWishlisted(true);
        onWishlistChange?.(product._id, true);
      }
    }catch(error){
      setError(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setIsSaving(false);
    }
    }
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer flex flex-col">
      {/* Image */}
      <div className="relative h-56 w-full bg-slate-800">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-red-200 font-bold tracking-wider uppercase backdrop-blur-[2px]">
            Out of Stock
          </div>
        )}
        <div className="absolute top-3 left-3 bg-slate-900/90 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide backdrop-blur-md">
          {product.category}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={isSaving}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all duration-200 border border-slate-700 shadow-md z-10"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label="Wishlist"
        >
          {isSaving ? "⏳" : isWishlisted ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-100 text-lg mb-1 line-clamp-1">{product.name}</h3>

        <p className="text-2xl font-extrabold text-indigo-500 mb-2">
          ₹{product.price.toLocaleString('en-IN')}
        </p>

        <p className={`text-sm font-semibold mb-4 ${isOutOfStock ? 'text-red-500' : product.stock <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
          {isOutOfStock
            ? '✗ Out of Stock'
            : product.stock <= 3
            ? `⚠ Only ${product.stock} left!`
            : `✓ ${product.stock} units in stock`}
        </p>

        {error && (
          <p className="text-xs text-red-400 mb-3 text-center">{error}</p>
        )}

        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => navigate(`/products/${product._id}`)}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
          >
            Details
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              isOutOfStock 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-sm'
            }`}
          >
            {isOutOfStock 
              ? 'Out of Stock' 
              : isAddingToCart 
              ? 'Adding...' 
              : isInCart 
              ? 'Add Another' 
              : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
