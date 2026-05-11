import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register
// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body; // no role here
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // role is not taken from req.body, it defaults to 'user'
    const user = await User.create({ name, email, password });

    const token = generateToken(user);

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // will always be 'user'
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    const message = err.message || "Server error";
    res.status(500).json({ message, error: message });
  }
});
// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // no role
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned. Please contact support." });
    }

    const token = generateToken(user);

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    const message = err.message || "Server error";
    res.status(500).json({ message, error: message });
  }
});
// Me
router.get("/me", protect, async (req, res) => {
  res.status(200).json(req.user);
});

// Get saved addresses
router.get("/me/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("savedAddresses");
    res.status(200).json(user?.savedAddresses || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Save new address
router.post("/me/addresses", protect, async (req, res) => {
  try {
    const { fullAddress, city, state, pincode, phone, label } = req.body;
    if (!fullAddress || !city || !pincode || !phone) {
      return res.status(400).json({ message: "fullAddress, city, pincode and phone are required" });
    }
    const user = await User.findById(req.user._id);
    if (!user.savedAddresses) user.savedAddresses = [];
    user.savedAddresses.push({
      fullAddress,
      city,
      state: state || "",
      pincode,
      phone,
      label: label || "Home",
    });
    await user.save();
    res.status(201).json(user.savedAddresses);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Delete saved address by _id
router.delete("/me/addresses/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.savedAddresses) user.savedAddresses = [];
    user.savedAddresses = user.savedAddresses.filter((a) => String(a._id) !== req.params.id);
    await user.save();
    res.status(200).json(user.savedAddresses);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Change password
router.post("/me/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Get favorites (populated)
router.get("/me/favorites", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites", "name image price discount category");
    res.status(200).json(user?.favorites || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Add to favorites
router.post("/me/favorites", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId required" });
    const user = await User.findById(req.user._id);
    if (!user.favorites) user.favorites = [];
    if (user.favorites.some((id) => String(id) === productId)) {
      return res.status(200).json(user.favorites);
    }
    user.favorites.push(productId);
    await user.save();
    res.status(201).json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Remove from favorites
router.delete("/me/favorites/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.favorites) user.favorites = [];
    user.favorites = user.favorites.filter((id) => String(id) !== req.params.productId);
    await user.save();
    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Generate JWT token
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in server environment");
  }
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export default router;
