const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");


// create order
module.exports.CreateOrder = async ({ userId, items }) => {
  let totalAmount = 0;
  let orderItems = [];

  for (let item of items) {
    const productId = item.productId;
    const product = await productModel.findOne({ _id: productId });

    if (!product) throw new Error("Product Not Found");
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const itemsTotal = product.price * item.quantity;
    totalAmount += itemsTotal;

    orderItems.push({
      productId: product._id,
      quantity: item.quantity,
      price: product.price,
      total: itemsTotal,
    });

    // Deduct stock
    product.stock -= item.quantity;
    await product.save();
  }

  return await orderModel.create({
    userId,
    items: orderItems,
    totalbill: totalAmount,
  });
};

// get order history or show order
module.exports.GetOrder = async (userId) => {
  return await orderModel
    .findOne({ userId })
    .sort({ createdAt: -1 });
};

// get all orders
module.exports.GetAllOrders = async () => {
  return await orderModel.find().sort({ createdAt: -1 });
};

// get single order by id
module.exports.GetOrderById = async (orderId) => {
  return await orderModel.findOne({ _id: orderId });
};

// update order status
module.exports.UpdateOrderStatus = async (orderId, status) => {
  return await orderModel.findOneAndUpdate(
    { _id: orderId },
    { status },
    { new: true }
  );
};

// update order payment
module.exports.UpdateOrderPayment = async (orderId, paymentId, paymentStatus) => {
  return await orderModel.findOneAndUpdate(
    { _id: orderId },
    { paymentId, paymentStatus },
    { new: true }
  );
};

// cancel order (refund stock)
module.exports.CancelOrder = async (orderId) => {
  const order = await orderModel.findOne({ _id: orderId });
  if (!order) throw new Error("Order not found");
  if (order.status !== "pending" && order.status !== "confirmed") {
    throw new Error("Cannot cancel order that has been shipped or delivered");
  }

  // Restore stock
  for (let item of order.items) {
    const product = await productModel.findOne({ _id: item.productId });
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.status = "cancelled";
  return await order.save();
};