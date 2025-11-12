import express from "express"
import authRoutes from './routes/auth.route.js'
import productRoutes from './routes/product.route.js'
import cartRoutes from './routes/cart.route.js'
import couponsRoutes from './routes/coupon.routes.js'
import { connectDB } from "./lib/db.js"
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
dotenv.config()

const app = express()

app.use(express.json())
app.use(cookieParser())

const PORT = process.env.PORT || 3001

app.use('/api/auth', authRoutes)
app.use('/api/product', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/coupons', couponsRoutes)


app.listen(PORT , () => {
    console.log(`Server started on port ${PORT}`);
    connectDB()
})