import express from "express";
import { registerCustomer, loginCustomer, getme, addtowishlist, removefromwishlist, getwishlist, addtocart, getcurrentusercart, updateCartQuantity, removeFromCart } from "../controllers/customer-rej.controllers.js";
import { isAuthenticated } from "../middleware/middleware.js";
const router = express.Router()

router.post('/register', registerCustomer)
router.post('/login', loginCustomer)
router.get('/me', isAuthenticated, getme)
router.post('/wishlist/:productId', isAuthenticated, addtowishlist)
router.get('/wishlist', isAuthenticated, getwishlist)
router.delete('/wishlist/:productId', isAuthenticated, removefromwishlist)
router.post('/cart/:productId', isAuthenticated, addtocart)
router.get('/cart', isAuthenticated, getcurrentusercart)
router.patch('/cart/:productId', isAuthenticated, updateCartQuantity)
router.delete('/cart/:productId', isAuthenticated, removeFromCart)
export default router;

