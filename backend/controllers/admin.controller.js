const adminService = require("../services/admin.service");
const orderService = require("../services/order.service");

const dashboard = async (_req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (_req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

const removeUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const listOrders = async (_req, res, next) => {
  try {
    const orders = await adminService.getAllOrders();
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json({ message: "Order status updated.", order });
  } catch (error) {
    next(error);
  }
};

const listCategories = async (_req, res, next) => {
  try {
    const categories = await adminService.getCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await adminService.createCategory(req.body);
    res.status(201).json({ message: "Category created successfully.", category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await adminService.updateCategory(req.params.id, req.body);
    res.json({ message: "Category updated successfully.", category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await adminService.deleteCategory(req.params.id);
    res.json({ message: "Category deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  dashboard,
  listUsers,
  removeUser,
  listOrders,
  updateOrderStatus,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
