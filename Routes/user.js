import express from "express";
import { login, profile, register, users, googleAuth } from "../Controllers/user.js";
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

export default router;
