# Shop-cart (ShopKart) 🛒

A full-stack modern e-commerce web application with cart management, user authentication, checkout flow, and secure Razorpay payment integration.

## 🚀 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend:** Node.js, Express.js, JWT, bcrypt
- **Database:** MongoDB Atlas (Mongoose)
- **Payment Gateway:** Razorpay (HMAC-SHA256 signature verification)

## 📁 Project Structure

```
e_commerceproject/
├── client/
│   └── shopkart_frontend/   # React Vite frontend application
├── server/
│   ├── config/              # Database and third-party configs
│   ├── controllers/         # Business logic (auth, orders, cart, etc.)
│   ├── middleware/          # Auth and error middleware
│   ├── models/              # Mongoose schemas (User, Product, Order, etc.)
│   ├── routes/              # Express API endpoints
│   └── utils/               # Helper utilities & signature verification
├── CHECKOUT_ORDERS_VIVA_GUIDE.md # Technical Viva and architecture reference
├── package.json
└── README.md
```

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance
- Razorpay developer test account

### 2. Backend Setup
1. Open the project root or `server` directory.
2. Create a `.env` file in `server/` with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
3. Install dependencies and start server:
   ```bash
   npm install
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd client/shopkart_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🔐 Security Highlights
- Password hashing with bcrypt
- JWT-based authentication
- Cryptographic payment verification via Razorpay HMAC-SHA256 digests
- Environment variables secured through `.gitignore`
