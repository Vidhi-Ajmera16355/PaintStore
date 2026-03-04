import express from "express";
import mongoose from "mongoose";
import bodyParser from "express";
import userRouter from "./Routes/user.js";
import productRouter from "./Routes/product.js";
import cartRouter from "./Routes/cart.js";
import addressRouter from "./Routes/address.js";
import cors from "cors";
import paymentRouter from "./Routes/payment.js";
import chatRouter from "./Routes/chat.js";       // ← ADD THIS

const app = express();
const port = 1000;

app.use(bodyParser.json());

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Home testing route
app.get("/", (req, res) => res.json({ message: "This is home route!!" }));

// User Router
app.use("/api/user", userRouter);

// Product Router
app.use("/api/product", productRouter);

// Cart Router
app.use("/api/cart", cartRouter);

// Address Router
app.use("/api/address", addressRouter);

// Payment Router
app.use("/api/payment", paymentRouter);

// Chat / Chatbot Router                         // ← ADD THIS
app.use("/api/chat", chatRouter);

// MongoDB connection
(async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        dbName: "MERN_E-Commerce",
      }
    );
    console.log("MongoDB Connected Successfully..!!");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
})();

// Global handler for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});