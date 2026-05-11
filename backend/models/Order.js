import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, default: "paid" },
    paymentProvider: { type: String, default: "stripe" },
    paymentIntentId: { type: String, default: "" },
    orderStatus: {
      type: String,
      enum: ["placed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
    },
    deliveryAddress: {
      fullAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);