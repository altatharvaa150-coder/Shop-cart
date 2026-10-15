import express from "express";
import { isAuthenticated } from "../middleware/middleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById
} from "../controllers/order.controller.js";

const router = express.Router();

// All order routes require authentication
router.post("/create-payment-order", isAuthenticated, createPaymentOrder);
router.post("/verify-payment", isAuthenticated, verifyPayment);
router.get("/", isAuthenticated, getOrders);
router.get("/:id", isAuthenticated, getOrderById);

export default router;
