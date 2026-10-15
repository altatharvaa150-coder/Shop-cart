import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import router from "./routes/customer.routes.js";
import cookieParser from 'cookie-parser'
import cors from 'cors'
import productRouter from "./routes/product.routes.js"
import orderRouter from "./routes/order.routes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') })


const app = express()
const port = process.env.PORT || 8005

// ── Production CORS ──
const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
};

app.use(cors(corsOptions))
app.use(express.json())//middleware
app.use(cookieParser())
app.use('/customers', router)
app.use('/products', productRouter)
app.use('/orders', orderRouter)

app.get('/', (req, res) => {
    res.send("hi its started")
})

// ── Health check endpoint ──
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Server is running"
    });
});

const mongoUri = process.env.dburi || process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URI;

if (!mongoUri) {
    console.error("❌ CRITICAL: MongoDB connection string is missing! Please configure 'dburi' or 'MONGO_URI' in your Render environment variables.");
} else {
    mongoose.connect(mongoUri)
        .then(() => console.log("Connected to MongoDB successfully"))
        .catch(err => console.error("MongoDB connection error:", err));
}

app.listen(port, "0.0.0.0", () => {
    console.log(`Server started at port ${port}`)
})