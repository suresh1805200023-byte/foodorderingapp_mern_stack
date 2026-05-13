# 🍗 GoldenChicken — MERN Stack Food Ordering App

A modern full-stack food ordering web application built using the MERN Stack with secure authentication, Stripe payments, admin dashboard, product management, discounts, notifications, favorites system, and responsive UI.

---

# 🚀 Live Demo

[GoldenChicken Live Website](https://foodorderingapp-mern-stack.onrender.com?utm_source=chatgpt.com)

---

# ✨ Features

## 👤 User Features

* User Registration & Login
* JWT Authentication
* Browse Food Menu
* Product Details Page
* Add to Cart
* Quantity Management
* Favorites / Wishlist
* Stripe Payment Integration
* Order Placement
* Responsive Design
* Order Success Page

---

## 🛠️ Admin Features

* Admin Dashboard
* Product Management
* Create Product
* Edit Product
* Delete Product
* Order Management
* User Management
* Discount Coupon Management
* Notifications Management
* Revenue Statistics

---

# 🧰 Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Ant Design
* Material UI
* Axios
* React Router DOM
* Stripe React SDK

---

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Multer
* Cloudinary
* Stripe API

---

# 📦 Backend Dependencies

```json
{
  "axios": "^1.13.6",
  "bcryptjs": "^3.0.3",
  "cloudinary": "^1.41.3",
  "cors": "^2.8.6",
  "dotenv": "^17.3.1",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "mongoose": "^9.3.0",
  "multer": "^2.1.1",
  "multer-storage-cloudinary": "^4.0.0",
  "react-router-dom": "^7.13.1",
  "stripe": "^20.4.1"
}
```

---

# 📦 Frontend Dependencies

```json
{
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@mui/icons-material": "^7.3.9",
  "@mui/material": "^7.3.9",
  "@stripe/react-stripe-js": "^5.6.1",
  "@stripe/stripe-js": "^8.10.0",
  "@tailwindcss/vite": "^4.2.1",
  "antd": "^6.3.2",
  "axios": "^1.13.6",
  "lucide-react": "^1.14.0",
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "react-router-dom": "^7.13.1",
  "tailwindcss": "^4.2.1"
}
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/foodorderingapp.git
```

---

# 🔧 Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file inside backend folder:

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

# 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file inside frontend folder:

```env
VITE_API_URL=http://localhost:5000

VITE_STRIPE_PUBLISHABLE_KEY=your_publishable_key
```

---

# 📁 Folder Structure

```bash
backend/
 ├── config/
 ├── middleware/
 ├── models/
 ├── routes/
 ├── uploads/
 ├── server.js

frontend/
 ├── public/
 ├── src/
 │   ├── assets/
 │   ├── components/
 │   ├── context/
 │   ├── pages/
 │   └── App.jsx
```

---

# 💳 Stripe Test Card

Use Stripe test mode:

```bash
4242 4242 4242 4242
```

Use:

* Any future expiry date
* Any CVV
* Any ZIP code

---

# 🌐 Deployment

* Frontend → Render
* Backend → Render
* Database → MongoDB Atlas
* Image Storage → Cloudinary

---

# 📸 Main Modules

* Authentication System
* Cart System
* Product CRUD
* Admin Dashboard
* Payment Gateway
* Discount Coupons
* Favorites System
* Notifications
* Responsive UI

---

# 🔒 Security

* JWT Authentication
* Protected Admin Routes
* Secure Password Hashing using bcryptjs
* Environment Variables for Secret Keys

---

# 📄 License

This project is built for educational and portfolio purposes.

---

# 👨‍💻 Developer

Developed by Suresh Kumar using the MERN Stack.

