import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true },
  mobile: { type: String, require: true, unique: true },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: String, default: Date.now },
});

export const User = mongoose.model("User", userSchema);