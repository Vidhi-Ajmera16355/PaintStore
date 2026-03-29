import express from "express";
import {
  checkout,
  userOrder,
  verify,
  allOrders,
  codCheckout
} from "../Controllers/payment.js";
import { Authenticated } from "../Middlewares/auth.js";
const router = express.Router();
// checkout
router.post("/checkout", checkout);

// cod checkout
router.post("/cod-checkout", codCheckout);

// verify and save to DB
router.post("/verify-payment", verify);

// user order
router.get("/userorder", Authenticated, userOrder);

// all order
router.get("/orders", allOrders);

export default router;
