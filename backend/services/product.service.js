const Product = require("../models/product.model");
const Category = require("../models/category.model");
const slugify = require("../utils/slugify");

const buildImageUrl = (req, fileName) =>
  `${req.protocol}://${req.get("host")}/uploads/products/${fileName}`;

const getProducts = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 8, 24);
  const skip = (page - 1) * limit;

  const filters = { isActive: true };

  if (query.search) {
    filters.$text = { $search: query.search.trim() };
  }

  if (query.category) {
    filters.categoryName = query.category;
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filters.price.$lte = Number(query.maxPrice);
  }

  let sort = { createdAt: -1 };
  if (query.sort === "price-asc") sort = { price: 1 };
  if (query.sort === "price-desc") sort = { price: -1 };
  if (query.sort === "name-asc") sort = { name: 1 };
  if (query.sort === "name-desc") sort = { name: -1 };

  const [products, total] = await Promise.all([
    Product.find(filters).populate("category").sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filters),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getFeaturedProducts = () =>
  Product.find({ featured: true, isActive: true }).populate("category").limit(8).sort({ createdAt: -1 });

const getProductById = async (id) => {
  const product = await Product.findById(id).populate("category");
  if (!product) {
    throw new Error("Product not found.");
  }

  return product;
};

const createProduct = async (payload, files, req) => {
  const category = await Category.findById(payload.category);
  if (!category) {
    throw new Error("Selected category does not exist.");
  }

  const slugBase = slugify(payload.name);
  const count = await Product.countDocuments({ slug: new RegExp(`^${slugBase}`) });
  const slug = count ? `${slugBase}-${count + 1}` : slugBase;

  const uploadedImages = (files || []).map((file) => buildImageUrl(req, file.filename));
  const imageSource = payload.imageUrls || payload.images;
  const manualImages = Array.isArray(imageSource)
    ? imageSource
    : typeof imageSource === "string" && imageSource.trim()
      ? imageSource.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  if (![...uploadedImages, ...manualImages].length) {
    throw new Error("At least one product image is required.");
  }

  return Product.create({
    name: payload.name,
    slug,
    description: payload.description,
    price: Number(payload.price),
    compareAtPrice: Number(payload.compareAtPrice || 0),
    stock: Number(payload.stock),
    brand: payload.brand || "",
    sku: payload.sku,
    images: [...uploadedImages, ...manualImages],
    category: category._id,
    categoryName: category.name,
    featured: String(payload.featured) === "true" || payload.featured === true,
  });
};

const updateProduct = async (id, payload, files, req) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found.");
  }

  if (payload.category) {
    const category = await Category.findById(payload.category);
    if (!category) {
      throw new Error("Selected category does not exist.");
    }
    product.category = category._id;
    product.categoryName = category.name;
  }

  if (payload.name) {
    product.name = payload.name;
    product.slug = slugify(payload.name);
  }

  if (payload.description) product.description = payload.description;
  if (payload.price !== undefined) product.price = Number(payload.price);
  if (payload.compareAtPrice !== undefined) product.compareAtPrice = Number(payload.compareAtPrice);
  if (payload.stock !== undefined) product.stock = Number(payload.stock);
  if (payload.brand !== undefined) product.brand = payload.brand;
  if (payload.sku) product.sku = payload.sku;
  if (payload.featured !== undefined) {
    product.featured = String(payload.featured) === "true" || payload.featured === true;
  }

  const uploadedImages = (files || []).map((file) => buildImageUrl(req, file.filename));
  const imageSource = payload.imageUrls || payload.images;
  const manualImages = Array.isArray(imageSource)
    ? imageSource
    : typeof imageSource === "string" && imageSource.trim()
      ? imageSource.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  if (uploadedImages.length || manualImages.length) {
    product.images = [...uploadedImages, ...manualImages];
  }

  await product.save();
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new Error("Product not found.");
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
