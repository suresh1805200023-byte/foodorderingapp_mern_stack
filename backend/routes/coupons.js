import express from "express";
import Discount from "../models/Discount.js";

const router = express.Router();

/** Public list: active coupons that are not expired */
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Discount.find({
      active: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
