import { User } from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vidhi2005ajmera@gmail.com',
    pass: 'uzdi awrd ktay uszl'
  }
});

export const register = async (req, res) => {
  const { name, email, mobile, password } = req.body;
  try {
    let user = await User.findOne({ $or: [{ email }, { mobile }] });
    if (user) return res.json({ message: "User with this email or mobile already exists", success: false });

    const hashPass = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, mobile, password: hashPass });
    res.json({ message: "User registered successfully..!!", user, success: true });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body; // email can also be mobile here
  try {
    let user = await User.findOne({ $or: [{ email: email }, { mobile: email }] });
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
    const googleClientIds = (
      process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || ""
    )
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!googleClientIds.length) {
      return res.status(500).json({
        message: "Google OAuth is not configured on the server",
        success: false,
      });
    }

    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientIds,
    });
    const payload = ticket.getPayload();
    const { email, name, email_verified: emailVerified } = payload;

    if (!email || !emailVerified) {
      return res.status(400).json({
        message: "Google account email is not verified",
        success: false,
      });
    }
    
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

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body; // could be email or mobile if needed, let's assume email for now
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "User with this email does not exist", success: false });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    const frontendUrl = (process.env.SITE_URL || 'https://frontend-store-paints.vercel.app').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await transporter.sendMail({
        to: user.email,
        subject: "Ajmera Paints - Password Reset",
        text: message
      });
      res.json({ message: "Reset token sent to email!", success: true });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.json({ message: "Email could not be sent", success: false });
    }
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.json({ message: "Invalid or expired reset token", success: false });
    }

    const { password } = req.body;
    if (!password) {
      return res.json({ message: "Please provide a new password", success: false });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully! You can now login.", success: true });
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};
