import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Cloudinary Storage setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "goldenchicken",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

// Multer using Cloudinary storage
const upload = multer({ storage });

export default upload;