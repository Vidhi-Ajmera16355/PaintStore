import { User } from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.json({ message: "User already exist", success: false });

    const hashPass = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashPass });
    res.json({ message: "User registered successfully..!!", user, success: true });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.json({ message: "User not found", success: false });

    if (!user.password) {
      return res.json({ message: "Please login with Google for this account", success: false });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.json({ message: "Invalid Credential", success: false });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "!@#$%^&*()",
      { expiresIn: "365d" }
    );

    res.json({
      message: `Welcome ${user.name} to Ajmera Paints!`,
      token,
      success: true,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  const { credential } = req.body;
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({ name, email });
    }
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "!@#$%^&*()",
      { expiresIn: "365d" }
    );
    
    res.json({
      message: `Welcome ${user.name} to Ajmera Paints!`,
      token,
      success: true,
      isAdmin: user.isAdmin,
    });
    
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};

export const users = async (req, res) => {
  try {
    let allUsers = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json({ users: allUsers, success: true });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const profile = async (req, res) => {
  res.json({ user: req.user });
};

// Make a user admin (admin only)
export const makeAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: true },
      { new: true }
    );
    if (!user) return res.json({ message: "User not found", success: false });
    res.json({ message: "User promoted to admin", user, success: true });
  } catch (error) {
    res.json({ message: error.message });
  }
};