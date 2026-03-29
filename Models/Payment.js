import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderDate: { type: Date, default: Date.now },
    payStatus: { type: String },
    orderStatus: {
      type: String,
      enum: ["Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Processing",
    },
    paymentMethod: { type: String, default: "Online" },
  },
  { strict: false }
);

export const Payment = mongoose.model("Payment", paymentSchema);