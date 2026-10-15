import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'Failed to fetch product details.');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6">
        <div className="bg-red-950/50 text-red-400 p-6 rounded-2xl text-center font-medium border border-red-900 max-w-md w-full shadow-sm">
          <p className="text-xl mb-4">Oops!</p>
          <p>{error || "Product not found."}</p>
          <button 
            onClick={() => navigate('/products')}
            className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        <button 
          onClick={() => navigate('/products')}
          className="mb-8 flex items-center text-slate-400 hover:text-indigo-400 transition-colors font-medium"
        >
          <span className="mr-2">←</span> Back to Products
        </button>

        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-800 flex flex-col md:flex-row">
          
          {/* Large Image Section */}
          <div className="w-full md:w-1/2 bg-slate-800 relative min-h-[400px]">
            <img 
              src={product.image} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-red-200 font-bold text-3xl tracking-wider uppercase backdrop-blur-[2px]">
                Out of Stock
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            
            <div className="mb-2">
              <span className="bg-slate-800 text-indigo-400 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 mb-4 leading-tight">
              {product.name}
            </h1>

            <p className="text-3xl font-extrabold text-indigo-500 mb-6">
              ₹{product.price?.toLocaleString('en-IN')}
            </p>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-100 mb-2">Description</h3>
              <p className="text-slate-400 leading-relaxed">
                {product.description || "No description available for this product."}
              </p>
            </div>

            <p className={`text-lg font-semibold mb-8 ${isOutOfStock ? 'text-red-500' : product.stock <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
              {isOutOfStock
                ? '✗ Currently Out of Stock'
                : product.stock <= 3
                ? `⚠ Hurry! Only ${product.stock} units left in stock!`
                : `✓ ${product.stock} units in stock`}
            </p>

            {/* Add to Cart Button (UI Only) */}
            <button
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                isOutOfStock 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5'
              }`}
              disabled={isOutOfStock}
              onClick={() => {
                if(!isOutOfStock) alert('Add to cart clicked! (UI Only)');
              }}
            >
              {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
