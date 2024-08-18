import express from "express";
import mongoose from "mongoose";
import bodyParser from "express";
import userRouter from "./Routes/user.js";
import productRouter from "./Routes/product.js";
import cartRouter from "./Routes/cart.js";
import addressRouter from "./Routes/address.js";
import cors from "cors";
import paymentRouter from "./Routes/payment.js";

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

// MongoDB connection
(async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://vidhi2005ajmera:2AB9ANB4yDypvCnt@cluster0.zeyng.mongodb.net/",
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
  // You can add logic here to log the error or take other actions
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
