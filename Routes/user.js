import express from "express";
import { login, profile, register, users, googleAuth, forgotPassword, resetPassword } from "../Controllers/user.js";
import { Authenticated } from "../Middlewares/auth.js";
const router = express.Router();

// register user
router.post("/register", register);
// login user
router.post("/login", login);
//get all users
router.get("/all", users);
// get user profile
router.get("/profile", Authenticated, profile);
// google auth login/register
router.post("/google-auth", googleAuth);
// forgot password
router.post("/forgot-password", forgotPassword);
// reset password
router.put("/reset-password/:token", resetPassword);

export default router;
