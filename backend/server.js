import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Import Routes & Middleware
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

// ✅ FIX FOR ES MODULES: Define __dirname manually
// This ensures path.join works correctly on Render
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// CORS Configuration
// Ensure process.env.CLIENT_URL is set to your Render frontend URL
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ✅ SERVE STATIC FILES
// This allows your frontend to access images stored in the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running ✅");
});

// --- API Routes ---

// Authentication
app.use("/api/users", authRoutes);

// Public Product Routes (No protection)
app.use("/api/pr", pr);

// Protected Admin Product Routes
app.use(
  "/api/products",
  protect,
  verifyAdmin,
  productRoutes
);

// Functional Routes
app.use("/api/coupons", couponsRoutes);
app.use("/api/payment", payment);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// General Admin Routes
app.use(
  "/api/admin",
  protect,
  verifyAdmin,
  adminRoutes
);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});