const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

const populateCart = (query) =>
  query.populate({
    path: "items.product",
    model: "product",
  });

const getOrCreateCart = async (userId) => {
  let cart = await populateCart(Cart.findOne({ user: userId }));
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await populateCart(Cart.findById(cart._id));
  }
  return cart;
};

const getCartSummary = (cart) => {
  const items = cart.items
    .filter((item) => item.product)
    .map((item) => ({
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0],
      stock: item.product.stock,
      quantity: item.quantity,
      lineTotal: item.product.price * item.quantity,
    }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    items,
    subtotal,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

const addToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new Error("Product is not available.");
  }

  const cart = await getOrCreateCart(userId);
  const qty = Math.max(Number(quantity) || 1, 1);
  const existingItem = cart.items.find((item) => item.product && item.product._id.toString() === productId);

  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    cart.items.push({ product: productId, quantity: qty });
  }

  await cart.save();
  const updated = await getOrCreateCart(userId);
  return getCartSummary(updated);
};

const updateCartItem = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found.");
  }

  const item = cart.items.find((entry) => entry.product.toString() === productId);
  if (!item) {
    throw new Error("Cart item not found.");
  }

  item.quantity = Math.max(Number(quantity) || 1, 1);
  await cart.save();
  const updated = await getOrCreateCart(userId);
  return getCartSummary(updated);
};

const removeCartItem = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found.");
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  const updated = await getOrCreateCart(userId);
  return getCartSummary(updated);
};

const clearCart = async (userId) => {
  await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { new: true, upsert: true });
};

module.exports = {
  getOrCreateCart,
  getCartSummary,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
