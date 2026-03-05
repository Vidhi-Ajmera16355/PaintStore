import { Payment } from "../Models/Payment.js";
import Product from "../Models/Product.js";
import { User } from "../Models/User.js";
import { Cart } from "../Models/Cart.js";

// GET /api/admin/dashboard
export const getDashboard = async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers, recentOrders, allOrders] = await Promise.all([
      Payment.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Payment.find().sort({ orderDate: -1 }).limit(5),
      Payment.find(),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    const ordersByStatus = {
      Processing: 0, Confirmed: 0, Shipped: 0,
      "Out for Delivery": 0, Delivered: 0, Cancelled: 0,
    };
    allOrders.forEach(o => {
      const s = o.orderStatus || "Processing";
      if (ordersByStatus[s] !== undefined) ordersByStatus[s]++;
    });

    res.json({
      success: true,
      stats: { totalOrders, totalProducts, totalUsers, totalRevenue },
      ordersByStatus,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Payment.find().sort({ orderDate: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ["Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid status", success: false });
    }

    const order = await Payment.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found", success: false });

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/products  (same as public but admin-only)
export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/products
export const addAdminProduct = async (req, res) => {
  try {
    const { title, description, price, category, qty, imgSrc } = req.body;
    const product = await Product.create({ title, description, price, category, qty, imgSrc });
    res.json({ success: true, message: "Product added!", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/products/:id
export const updateAdminProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found", success: false });
    res.json({ success: true, message: "Product updated!", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/products/:id
export const deleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found", success: false });
    res.json({ success: true, message: "Product deleted!", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users
export const getAdminUsers = async (req, res) => {
  try {
    const allUsers = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json({ success: true, users: allUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};