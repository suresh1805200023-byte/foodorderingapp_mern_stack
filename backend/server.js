import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from "./routes/productAdmin.js";
import { protect } from './middleware/auth.js';
import verifyAdmin from './middleware/role.js';
import pr from './routes/product.js';
import payment from './routes/payment.js';
import orderRoutes from './routes/order.js';
import reviewRoutes from './routes/review.js';
import adminRoutes from "./routes/Admin.js";
import couponsRoutes from "./routes/coupons.js";
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
app.use(cors());

// Routes
app.use("/api/users", authRoutes);
app.use('/api/products', protect, verifyAdmin, productRoutes);
app.use("/uploads",express.static('uploads'));
app.use('/api/pr',pr);
app.use("/api/coupons", couponsRoutes);
app.use('/api/payment',payment);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/api/admin", protect, verifyAdmin, adminRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});