import Razorpay from "razorpay";

// Lazy initialization — env vars aren't available when this module
// is first imported (dotenv runs in index.js). We create the instance
// on first use instead.
let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
};

export default getRazorpay;
