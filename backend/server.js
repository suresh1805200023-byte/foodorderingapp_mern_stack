import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/productAdmin.js";
import { protect } from "./middleware/auth.js";
import verifyAdmin from "./middleware/role.js";
import pr from "./routes/product.js";
import payment from "./routes/payment.js";
import orderRoutes from "./routes/order.js";
import reviewRoutes from "./routes/review.js";
import adminRoutes from "./routes/Admin.js";
import couponsRoutes from "./routes/coupons.js";

const PORT = process.env.PORT || 5000;
const app = express();

// ✅ Required for ES Modules (important on Render)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
connectDB();

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ✅ FIXED STATIC FILES (IMPORTANT FOR RENDER)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running ✅");
});

// Routes
app.use("/api/users", authRoutes);

// Public Product Routes
app.use("/api/pr", pr);

// Admin Product Routes
app.use(
  "/api/products",
  protect,
  verifyAdmin,
  productRoutes
);

app.use("/api/coupons", couponsRoutes);
app.use("/api/payment", payment);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// Admin Routes
app.use(
  "/api/admin",
  protect,
  verifyAdmin,
  adminRoutes
);

// Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});