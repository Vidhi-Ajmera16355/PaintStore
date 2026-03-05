import express from "express";
import { AdminOnly } from "../Middlewares/auth.js";
import {
  getDashboard,
  getAllOrders,
  updateOrderStatus,
  getAdminProducts,
  addAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminUsers,
} from "../Controllers/admin.js";
import { makeAdmin } from "../Controllers/user.js";

const adminRouter = express.Router();

// All routes protected by AdminOnly middleware
adminRouter.get("/dashboard", AdminOnly, getDashboard);

adminRouter.get("/orders", AdminOnly, getAllOrders);
adminRouter.put("/orders/:id/status", AdminOnly, updateOrderStatus);

adminRouter.get("/products", AdminOnly, getAdminProducts);
adminRouter.post("/products", AdminOnly, addAdminProduct);
adminRouter.put("/products/:id", AdminOnly, updateAdminProduct);
adminRouter.delete("/products/:id", AdminOnly, deleteAdminProduct);

adminRouter.get("/users", AdminOnly, getAdminUsers);
adminRouter.put("/users/:id/make-admin", AdminOnly, makeAdmin);

export default adminRouter;