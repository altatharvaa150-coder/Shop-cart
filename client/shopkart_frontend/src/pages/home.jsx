import React from 'react'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user } = useAuth()

  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: "$199",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      id: 2,
      name: "Smart Watch",
      price: "$299",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      id: 3,
      name: "Camera Lens",
      price: "$499",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      id: 4,
      name: "Sneakers",
      price: "$129",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-100">Welcome, {user?.fullName || 'User'} 👋</h1>
        <p className="mt-2 text-slate-400 mb-8">You are logged in to ShopKart.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-slate-100">{product.name}</h3>
                <p className="text-slate-400 mt-1">{product.price}</p>
                <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
