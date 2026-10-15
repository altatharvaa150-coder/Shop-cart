import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/login"
import Home from "./pages/home"
import Register from "./pages/register"
import Products from "./pages/Products"
import ProductDetails from "./components/ProductDetails"
import ProtectedRoute from "./components/ProtectedRoute"
import PublicRoute from "./components/PublicRoute"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import Navbar from "./components/Navbar"
import Wishlist from "./pages/Wishlist"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import OrderSuccess from "./pages/OrderSuccess"
import Orders from "./pages/Orders"
import OrderDetails from "./pages/OrderDetails"

// Layout wrapper that adds Navbar to protected pages
function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Navbar />
      {children}
    </ProtectedRoute>
  )
}

function App() {
  return (
    <>
     <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<ProtectedLayout><Home/></ProtectedLayout>}/>
            <Route path="/login" element={<PublicRoute><Login/></PublicRoute>}/>
            <Route path="/register" element={<PublicRoute><Register/></PublicRoute>}/>
            <Route path="/home" element={<ProtectedLayout><Home/></ProtectedLayout>}/>
            <Route path="/products" element={<ProtectedLayout><Products/></ProtectedLayout>}/>
            <Route path="/products/:id" element={<ProtectedLayout><ProductDetails/></ProtectedLayout>}/>
            <Route path="/wishlist" element={<ProtectedLayout><Wishlist/></ProtectedLayout>}/>
            <Route path="/cart" element={<ProtectedLayout><Cart/></ProtectedLayout>}/>
            <Route path="/checkout" element={<ProtectedLayout><Checkout/></ProtectedLayout>}/>
            <Route path="/order-success/:id" element={<ProtectedLayout><OrderSuccess/></ProtectedLayout>}/>
            <Route path="/orders" element={<ProtectedLayout><Orders/></ProtectedLayout>}/>
            <Route path="/orders/:id" element={<ProtectedLayout><OrderDetails/></ProtectedLayout>}/>
          </Routes>
        </CartProvider>
      </AuthProvider>
     
     </BrowserRouter>
    </>
  )
}

export default App