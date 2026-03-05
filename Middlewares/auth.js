import jwt from "jsonwebtoken";
import { User } from "../Models/User.js";

export const Authenticated = async (req, res, next) => {
  const token = req.header("Auth");
  if (!token) return res.json({ message: "Login first" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET || "!@#$%^&*()");
  const id = decoded.userId;
  const user = await User.findById(id);
  if (!user) return res.json({ message: "User not exist" });

  req.user = user;
  next();
};

export const AdminOnly = async (req, res, next) => {
  const token = req.header("Auth");
  if (!token) return res.status(401).json({ message: "Login first", success: false });

  const decoded = jwt.verify(token, process.env.JWT_SECRET || "!@#$%^&*()");
  const user = await User.findById(decoded.userId);

  if (!user) return res.status(401).json({ message: "User not found", success: false });
  if (!user.isAdmin) return res.status(403).json({ message: "Admin access required", success: false });

  req.user = user;
  next();
};