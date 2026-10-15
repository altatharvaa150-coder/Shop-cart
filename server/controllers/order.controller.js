import crypto from "crypto";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import getRazorpay from "../config/razorpay.js";

// ─── POST /orders/create-payment-order ──────────────────────────────
// Validates cart, creates ShopKart pending order + Razorpay order
export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // ── 1. Validate shipping address ──
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({ success: false, message: "All shipping address fields are required" });
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: "Phone must be a valid 10-digit number" });
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({ success: false, message: "Pincode must be exactly 6 digits" });
    }

    // ── 2. Load user's cart ──
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    // ── 3. Load latest product data & verify stock ──
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of user.cart) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product no longer exists (ID: ${cartItem.product}). Please remove it from your cart.`
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`
        });
      }

      // ── 4. Build order snapshot ──
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image
      });

      totalAmount += product.price * cartItem.quantity;
    }

    // ── 5. Create pending ShopKart order ──
    const shopKartOrder = await Order.create({
      user: user._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim()
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT"
    });

    // ── 6. Create Razorpay Order (amount in paise) ──
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: shopKartOrder._id.toString()
    });

    // ── 7. Save Razorpay order ID ──
    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    // ── 8. Return checkout data ──
    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID // Key ID is safe to send, NOT the secret
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── POST /orders/verify-payment ────────────────────────────────────
// Verifies Razorpay HMAC signature, marks order PAID, clears cart
export const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "All payment fields are required" });
    }

    // ── 1. Find the ShopKart order ──
    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify this order belongs to the authenticated user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // ── 2. Verify HMAC SHA256 signature ──
    // Use the Razorpay order ID stored in our DB (trusted), not from browser
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Mark order as failed
      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment could not be verified."
      });
    }

    // ── 3. Mark order as PAID ──
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // ── 4. Deduct stock ──
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // ── 5. Clear user's cart (only after successful verification!) ──
    const user = await Customer.findById(req.user._id);
    user.cart = [];
    await user.save();

    // ── 6. Return confirmed order ──
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Order placed!",
      order
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── GET /orders ────────────────────────────────────────────────────
// Returns all orders for the authenticated user, newest first
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── GET /orders/:id ────────────────────────────────────────────────
// Returns a single order — must belong to the authenticated user
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Ownership check — never let a user see another user's order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
