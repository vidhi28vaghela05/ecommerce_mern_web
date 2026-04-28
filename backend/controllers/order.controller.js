const orderService = require("../services/order.service");

// create order
module.exports.CreateOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    const order = await orderService.CreateOrder({ userId, items });

    if (!order) {
      return res.status(404).json("Products not Found");
    }

    return res
      .status(200)
      .json({ message: "Order Created Successfully", order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get order - show history or recent order
module.exports.GetOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await orderService.GetOrder(userId);

    if (!order) return res.status(404).json({ message: "Order Not Found !!" });

    return res
      .status(200)
      .json({ message: "Order Featch Successfully", order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get all orders (admin)
module.exports.GetAllOrders = async (req, res) => {
  try {
    const orders = await orderService.GetAllOrders();
    return res.status(200).json({ message: "Orders fetched", orders });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get single order
module.exports.GetSingleOrder = async (req, res) => {
  try {
    const order = await orderService.GetOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json({ order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// update order status
module.exports.UpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderService.UpdateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// cancel order
module.exports.CancelOrder = async (req, res) => {
  try {
    const order = await orderService.CancelOrder(req.params.id);
    return res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get order deatils and show order stauts
module.exports.GetOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await orderService.GetOrder(userId);

    if (!order) return res.status(404).json({ message: "Order Not Found !!" });

    return res
      .status(200)
      .json({ message: "Order Featch Successfully", order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
