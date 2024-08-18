import express from "express";
import {
  addProduct,
  deleteProductById,
  getProductById,
  getProducts,
  updateProductById,
} from "../Controllers/product.js";

const router = express.Router();

// add product
router.post("/add", addProduct);

//get products
router.get("/all", getProducts);

// get Product By Id
router.get("/:id", getProductById);

// update Product by Id
router.put("/:id", updateProductById);

// delete Product by Id
router.delete("/:id", deleteProductById);
export default router;
