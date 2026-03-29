import { Payment } from "../Models/Payment.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const checkout = async (req, res) => {
  const { amount, cartItems, userShipping, userId } = req.body;
  var options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };
  const order = await razorpay.orders.create(options);

  res.json({
    orderId: order.id,
    amount: amount,
    cartItems,
    userShipping,
    userId,
    payStatus: "created",
  });
};

export const verify = async (req, res) => {
  const {
    orderId,
    paymentId,
    signature,
    amount,
    orderItems,
    userId,
    userShipping,
  } = req.body;

  let orderConfirm = await Payment.create({
    orderId,
    paymentId,
    signature,
    amount,
    orderItems,
    userId,
    userShipping,
    payStatus: "paid!",
  });
  res.json({ message: "payment successfull..", success: true, orderConfirm });
};

export const codCheckout = async (req, res) => {
  const { amount, orderItems, userShipping, userId } = req.body;

  // Add 10% fee for COD
  const totalAmount = Math.round(amount + (amount * 0.10));
  
  try {
    let orderConfirm = await Payment.create({
      orderId: `COD_${Date.now()}`,
      paymentId: "COD",
      signature: "COD",
      amount: totalAmount,
      orderItems,
      userId,
      userShipping,
      payStatus: "COD",
      paymentMethod: "COD"
    });
    res.json({ message: "COD Order successfully placed", success: true, orderConfirm });
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};

// user specificorder
export const userOrder = async (req, res) => {
  let userId = req.user._id.toString();
  // console.log(userId)
  let orders = await Payment.find({ userId: userId }).sort({ orderDate: -1 });
  res.json(orders);
};

// user specificorder
export const allOrders = async (req, res) => {
  let orders = await Payment.find().sort({ orderDate: -1 });
  res.json(orders);
};
