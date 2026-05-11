import express from "express";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// POST review (after purchase) - protected, user must own the order
router.post("/", protect, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    if (!orderId || rating == null) {
      return res.status(400).json({ message: "orderId and rating required" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your order" });
    }
    const existing = await Review.findOne({ orderId, userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You already reviewed this order" });
    }
    const review = new Review({
      orderId,
      userId: req.user._id,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment || "",
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET reviews for an order
router.get("/order/:orderId", async (req, res) => {
  try {
    const reviews = await Review.find({ orderId: req.params.orderId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
