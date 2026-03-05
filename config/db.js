import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "MERN_E-Commerce",
    });

    isConnected = db.connections[0].readyState;
    console.log("MongoDB Connected Successfully..!!");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;