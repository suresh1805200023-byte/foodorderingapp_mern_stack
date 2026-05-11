import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get my orders - protected
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("products.productId", "name image price discount");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;