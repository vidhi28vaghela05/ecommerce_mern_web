const orderService = require("../services/order.service");

const checkout = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user, req.body.shippingAddress);
    res.status(201).json({ message: "Order placed successfully.", order });
  } catch (error) {
    next(error);
  }
};

const listMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user._id);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json({ message: "Order status updated.", order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  listMyOrders,
  updateStatus,
};
