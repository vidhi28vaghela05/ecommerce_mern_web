const productService = require("../services/product.service");
const productModel = require("../models/product.model");

// add new products
module.exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    stock,
    price,
    discount,
    isNewProduct,
    sku,
    images,
    brand,
    category,
  } = req.body;

  const isExist = await productModel.findOne({ sku: sku });

  if (isExist) {
    return res.status(400).json({ messge: "Product Already Registerd" });
  }

  const product = await productService.createProduct({
    name,
    description,
    stock,
    price,
    discount,
    isNewProduct,
    sku,
    images,
    brand,
    category,
  });

  return res.status(200).json({ msg: "Product Added Sucessfully", product });
};

// all products with search, filter and sorting
module.exports.allProduct = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (sortBy) filters.sortBy = sortBy;

    const products = await productService.AllProduct(filters);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Products Not Found !!" });
    }

    return res.status(200).json({ message: "Fetch All Products:", products });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get featured/new products
module.exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await productService.getFeaturedProducts();

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Products Not Found !!" });
    }

    return res.status(200).json({ message: "Featured Products:", products });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get products by category
module.exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await productService.getProductsByCategory(category);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Products Not Found !!" });
    }

    return res.status(200).json({ message: "Products by category:", products });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// single product
module.exports.singleProduct = async (req, res) => {
  try {
    const product = await productService.singleProduct(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product Not Found !!" });
    }

    return res.status(200).json({ message: "Product Found !!", product });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// update product
module.exports.updateProduct = async (req, res) => {
  const productId = req.params.id;

  const {
    name,
    description,
    stock,
    price,
    discount,
    isNewProduct,
    sku,
    images,
    brand,
    category,
  } = req.body;

  const updatedProduct = await productService.updateProduct({
    productId,
    name,
    description,
    stock,
    price,
    discount,
    isNewProduct,
    sku,
    images,
    brand,
    category,
  });

  return res
    .status(200)
    .json({ message: "User Update Sucessfully", updatedProduct });     
};

// delete product
module.exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await productService.deleteProduct(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product Not Found !!" });
    }

    return res.status(200).json({ message: "Product Deleted Successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
