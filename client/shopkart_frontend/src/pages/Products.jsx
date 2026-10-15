import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

import ProductCard from '../components/ProductCard';
// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
      try {
          setLoading(true);
          setError(null);

          const params = {};
          if (search.trim()) {
              params.search = search.trim();
          }
          if (category && category !== 'All') {
              params.category = category;
          }

          const productsData = await api.get('/products', { params });
          setProducts(productsData.data.products);
          setLoading(false);
      }
      catch (error) {
          console.error('Error fetching products:', error);
          setError(error.message || 'Something went wrong while loading products.');
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchProducts();
  }, [search, category]);

  const categories = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 md:p-10">
      
      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight mb-3">
          Discover Products
        </h1>
        <p className="text-slate-400 text-lg">Browse our curated collection of premium items</p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ── Search + Filter Bar ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-800">
          
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="w-full md:w-auto">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-48 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-300 font-medium appearance-none cursor-pointer transition-colors"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat === 'All Categories' ? 'All' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Results Count & State ── */}
        <div className="mb-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <span className="ml-3 text-slate-400 font-medium">Loading products...</span>
            </div>
          ) : error ? (
            <div className="bg-red-950/50 text-red-400 p-4 rounded-xl text-center font-medium border border-red-900">
              {error}
            </div>
          ) : (
            <p className="text-slate-400 font-medium">
              Showing <strong className="text-slate-100">{products.length}</strong> product{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* ── Product Grid ── */}
        {!loading && !error && products.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 shadow-sm">
            <span className="text-6xl mb-4 block">🛍️</span>
            <p className="text-xl text-slate-400 font-medium">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {!loading && !error && products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
