const User = require("../models/user.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const Category = require("../models/category.model");
const { sanitizeUser } = require("./user.service");
const slugify = require("../utils/slugify");

const getDashboardStats = async () => {
  const [users, orders, products, categories, revenue] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments(),
    Category.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
  ]);

  return {
    totalUsers: users,
    totalOrders: orders,
    totalProducts: products,
    totalCategories: categories,
    totalRevenue: revenue[0]?.total || 0,
  };
};

const getAllUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(sanitizeUser);
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error("User not found.");
  }
};

const getAllOrders = () =>
  Order.find().populate("user", "name email").sort({ createdAt: -1 });

const getCategories = () => Category.find().sort({ name: 1 });

const createCategory = async ({ name, description, image }) => {
  const slug = slugify(name);
  const exists = await Category.findOne({ slug });
  if (exists) {
    throw new Error("Category already exists.");
  }

  return Category.create({ name, slug, description, image });
};

const updateCategory = async (id, { name, description, image }) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new Error("Category not found.");
  }

  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  await category.save();
  return category;
};

const deleteCategory = async (id) => {
  const linkedProducts = await Product.countDocuments({ category: id });
  if (linkedProducts) {
    throw new Error("Delete or reassign products in this category first.");
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new Error("Category not found.");
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllOrders,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
