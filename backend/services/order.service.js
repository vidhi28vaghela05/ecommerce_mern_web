const Order = require("../models/order.model");
const Product = require("../models/product.model");
const { getOrCreateCart, clearCart } = require("./cart.service");

const createOrder = async (user, shippingAddress) => {
  const cart = await getOrCreateCart(user._id);
  if (!cart.items.length) {
    throw new Error("Your cart is empty.");
  }

  const items = [];

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product._id || cartItem.product);
    if (!product || !product.isActive) {
      throw new Error("One or more products are no longer available.");
    }

    if (product.stock < cartItem.quantity) {
      throw new Error(`Insufficient stock for ${product.name}.`);
    }

    product.stock -= cartItem.quantity;
    await product.save();

    items.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: cartItem.quantity,
      lineTotal: product.price * cartItem.quantity,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = subtotal > 1000 ? 0 : 99;
  const totalAmount = subtotal + shippingFee;

  const order = await Order.create({
    user: user._id,
    items,
    shippingAddress,
    paymentMethod: "Cash on Delivery",
    subtotal,
    shippingFee,
    totalAmount,
  });

  await clearCart(user._id);
  return order;
};

const getUserOrders = (userId) =>
  Order.find({ user: userId }).sort({ createdAt: -1 });

const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  order.status = status;
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  getUserOrders,
  updateOrderStatus,
};
