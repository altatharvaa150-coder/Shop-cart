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
const port = 8005

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())//middleware
app.use(cookieParser())
app.use('/customers', router)
app.use('/products', productRouter)
app.use('/orders', orderRouter)

app.get('/', (req, res) => {
    res.send("hi its started")
})

mongoose.connect(process.env.dburi).then(() => console.log("connected to mongo biatch")).catch(err => console.log(err))

app.listen(port, () => {
    console.log("Server started at port 8005")
})