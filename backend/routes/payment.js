import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";

dotenv.config();

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

async function calculateTotalFromDb(products) {
  let total = 0;
  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error("Product not found");
    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;
    const effectivePrice = discount ? price * (1 - discount / 100) : price;
    total += effectivePrice * (item.quantity || 1);
  }
  return Math.round(total * 100) / 100;
}

// Create PaymentIntent (amount is computed on server from DB)
router.post("/create-payment-intent", protect, async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ message: "Stripe not configured. Add STRIPE_SECRET_KEY to backend .env" });
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) return res.status(400).json({ message: "Products required" });

    const totalAmount = await calculateTotalFromDb(products);
    const amountPaise = Math.round(Number(totalAmount) * 100);
    if (amountPaise < 50) return res.status(400).json({ message: "Amount too small" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountPaise,
      currency: "inr",
      metadata: {
        userId: String(req.user._id),
        products: JSON.stringify(products),
      },
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message || "Payment error" });
  }
});

// Confirm payment success (verify PaymentIntent) and create order
router.post("/confirm", protect, async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ message: "Stripe not configured" });
    const { paymentIntentId, deliveryAddress, products } = req.body;
    if (!paymentIntentId) return res.status(400).json({ message: "paymentIntentId required" });
    if (!Array.isArray(products) || products.length === 0) return res.status(400).json({ message: "Products required" });
    const addr = deliveryAddress || {};
    if (!addr.fullAddress || !addr.city || !addr.pincode || !addr.phone) {
      return res.status(400).json({ message: "Delivery address (full address, city, pincode, phone) is required" });
    }

    const existing = await Order.findOne({ paymentIntentId, userId: req.user._id });
    if (existing) return res.status(200).json(existing);

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") return res.status(400).json({ message: "Payment not completed" });

    const totalAmount = await calculateTotalFromDb(products);

    const newOrder = new Order({
      userId: req.user._id,
      products,
      totalAmount,
      paymentStatus: "paid",
      paymentProvider: "stripe",
      paymentIntentId,
      deliveryAddress: {
        fullAddress: addr.fullAddress,
        city: addr.city,
        state: addr.state || "",
        pincode: addr.pincode,
        phone: addr.phone,
      },
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
