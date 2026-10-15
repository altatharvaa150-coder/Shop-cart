
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';


function Wishlist() {
  const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchwithlist =async () =>{
      try{
        setLoading(true);
      setError(null);
      const res = await api.get('/customers/wishlist');
      setWishlist(res.data.wishlist || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
      }
      useEffect(()=>{
        fetchwithlist()
      },[])// ran it inside a useeffect to stop an infinite loop
      
    
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 md:p-10">
      
      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight mb-3">
          My Wishlist ❤️
        </h1>
        <p className="text-slate-400 text-lg">
          Your saved items for later purchase
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ── Loading State ── */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-slate-400 font-medium">Loading your wishlist...</span>
          </div>
        )}

        {/* ── Error State ── */}
        {error && (
          <div className="bg-red-950/50 text-red-400 p-6 rounded-2xl text-center font-medium border border-red-900 mb-8 max-w-md mx-auto">
            <p className="text-lg font-bold mb-1">Something went wrong.</p>
            <p className="text-sm text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchwithlist}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 shadow-sm max-w-2xl mx-auto px-6">
            <span className="text-6xl mb-4 block">🤍</span>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Your wishlist is empty</h2>
            <p className="text-slate-400 mb-6">Explore our products and tap the heart icon to save items here.</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              Browse Products
            </button>
          </div>
        )}

        {/* ── Wishlist Grid ── */}
        {!loading && !error && wishlist.length > 0 && (
          <>
            <p className="text-slate-400 font-medium mb-6">
              Saved items (<strong className="text-slate-100">{wishlist.length}</strong>)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  initialWishlisted={true}
                  onWishlistChange={(removedId) => {
                    setWishlist((prev) => prev.filter((p) => p._id !== removedId));
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
