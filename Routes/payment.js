import express from "express";
import {
  checkout,
  userOrder,
  verify,
  allOrders,
} from "../Controllers/payment.js";
import { Authenticated } from "../Middlewares/auth.js";
const router = express.Router();
// checkout
router.post("/checkout", checkout);

// verify and save to DB
router.post("/verify-payment", verify);

// user order
router.get("/userorder", Authenticated, userOrder);

// all order
router.get("/orders", allOrders);

export default router;
