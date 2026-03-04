import Product from "../Models/Product.js";

// add product
export const addProduct = async (req, res) => {
  try {
    const { title, description, price, category, qty, imgSrc } = req.body;

    const product = await Product.create({
      title,
      description,
      price,
      category,
      qty,
      imgSrc,
    });

    res.json({ message: "Product added successfully!", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ message: "All Products", products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get product by id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Invalid Id" });

    res.json({ message: "Specific Product", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update
export const updateProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Invalid Id" });

    res.json({ message: "Product updated!", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete
export const deleteProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Invalid Id" });

    res.json({ message: "Product deleted!", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};