import express from "express";
import Product from "../models/Product.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
const router = express.Router();

// GET ALL PRODUCTS (admin list)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD PRODUCT
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);

      imageUrl = result.secure_url;
    }

    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      discount: req.body.discount ?? 0,
      category: req.body.category,
      available:
        req.body.available !== undefined
          ? req.body.available === "true"
          : true,

      image: imageUrl,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE PRODUCT
router.delete("/delete/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE PRODUCT (optional image upload)
router.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const update = { ...req.body };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);

      update.image = result.secure_url;
    }

    if (req.body.available !== undefined) {
      update.available = req.body.available === "true";
    }

    if (update.discount !== undefined) {
      update.discount = Number(update.discount) || 0;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SEARCH PRODUCT
router.get("/search", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const products = await Product.find({
      name: { $regex: keyword, $options: "i" },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
