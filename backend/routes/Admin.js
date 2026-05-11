import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Discount from "../models/Discount.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
    ]);

    const revenueData = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.json({ totalProducts, totalOrders, totalUsers, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("products.productId", "name image price discount");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const allowed = ["placed", "preparing", "out_for_delivery", "delivered", "cancelled"];
    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid orderStatus" });
    }
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { orderStatus } },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("products.productId", "name image price discount");
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Ban / Unban user
router.patch("/users/:id/ban", async (req, res) => {
  try {
    const { isBanned, reason } = req.body;
    const ban = Boolean(isBanned);
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isBanned: ban,
          bannedAt: ban ? new Date() : null,
          banReason: ban ? String(reason || "").slice(0, 300) : "",
        },
      },
      { new: true }
    ).select("-password");
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Discounts
router.get("/discounts", async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.status(200).json(discounts);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.post("/discounts", async (req, res) => {
  try {
    const { code, type, value, minOrder, expiresAt } = req.body;
    if (!code || value === undefined) return res.status(400).json({ message: "code and value are required" });
    const created = await Discount.create({
      code: String(code).toUpperCase(),
      type: type || "percent",
      value: Number(value),
      minOrder: Number(minOrder) || 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.patch("/discounts/:id", async (req, res) => {
  try {
    const allowed = ["type", "value", "minOrder", "active", "expiresAt", "code"];
    const update = {};
    for (const k of allowed) if (k in req.body) update[k] = req.body[k];
    if ("code" in update) update.code = String(update.code).toUpperCase();
    if ("value" in update) update.value = Number(update.value);
    if ("minOrder" in update) update.minOrder = Number(update.minOrder);
    if ("expiresAt" in update) update.expiresAt = update.expiresAt ? new Date(update.expiresAt) : null;
    const updated = await Discount.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!updated) return res.status(404).json({ message: "Discount not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.delete("/discounts/:id", async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Notifications
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(200);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.post("/notifications", async (req, res) => {
  try {
    const { title, message, level } = req.body;
    if (!title) return res.status(400).json({ message: "title required" });
    const created = await Notification.create({ title, message: message || "", level: level || "info" });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.post("/notifications/mark-all-read", async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.status(200).json({ message: "OK" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.patch("/notifications/:id", async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { read: Boolean(req.body.read) } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;