import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const CartProvider = ({ children }) => { 
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
        // 1. Fetch cart from backend
    const fetchCart = async () => {
        if (!user) {
            setCart([]);
            return;// it help to wipe the cart data visible in other ppl cart,this code runs after login/logout
        }
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/customers/cart");
            setCart(res.data.cart || []);// stores in global and if its null its stored and a back up as []
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch whenever the user logs in or logs out
    useEffect(() => {
        fetchCart();
    }, [user]); // we only one once  
    const addtocart = async(productId) =>{
        try {
            setError(null);
            const res = await api.post(`/customers/cart/${productId}`);// this helps to avoid the problem of adding same id 
            setCart(res.data.cart || []);
            return { success: true };
        }catch (err) {
            const msg = err.response?.data?.message || "Failed to add to cart";
            setError(msg);
            return { success: false, message: msg };
        }
    };
     const updateQuantity = async (productId, quantity) => {
        try {
            setError(null);
            const res = await api.patch(`/customers/cart/${productId}`, { quantity });// doubt innside obj to update the quantity and put for whole obj
            setCart(res.data.cart || []); 
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update quantity";
            setError(msg);
            return { success: false, message: msg };
        }
    };
     const removeFromCart = async (productId) => {
        try {
            setError(null);
            const res = await api.delete(`/customers/cart/${productId}`);
            setCart(res.data.cart || []);
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to remove item";
            setError(msg);
            return { success: false, message: msg };
        } 

    };
     // Clear cart locally (called after successful order placement)
     const clearCart = () => {
        setCart([]);
     };
     const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const subtotal = cart.reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + price * (item.quantity || 0);
    }, 0);
        return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                error,
                totalCount,
                subtotal,
                fetchCart,
                addToCart: addtocart,
                updateQuantity,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
export const useCart = () => useContext(CartContext);

