const productService = require("../services/product.service");

const listProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const featuredProducts = async (_req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts();
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.files, req);
    res.status(201).json({ message: "Product created successfully.", product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      req.files,
      req
    );
    res.json({ message: "Product updated successfully.", product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProducts,
  featuredProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
