import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

function Navbar() {
  const { user, setUser } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      // Even if API fails, clear local state
    }
    setUser(null);
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <nav className="bg-slate-950 border-b border-slate-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <NavLink to="/home" className="text-xl font-extrabold text-white tracking-tight">
          🛒 Shop<span className="text-indigo-500">Kart</span>
        </NavLink>

        {/* Nav Links */}
        <div className="flex items-center gap-2">
          <NavLink to="/home" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            Products
          </NavLink>
          <NavLink to="/wishlist" className={linkClass}>
            Wishlist ❤️
          </NavLink>
          <NavLink to="/orders" className={linkClass}>
            My Orders 📦
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            Cart ({totalCount || 0})
          </NavLink>
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-slate-300 font-medium hidden sm:inline">
              Hi, {user.fullName || 'User'}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-950 text-red-400 hover:bg-red-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
