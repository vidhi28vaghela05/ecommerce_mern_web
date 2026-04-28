const cartModel = require("../models/cart.model");

// add item to cart
module.exports.addToCart = async ({ userId, item }) => {
  let cart = await cartModel.findOne({ userId });

  if (!cart) cart = new cartModel({ userId, items: [] });

  // Check if product already exists in cart
  const existIndex = cart.items.findIndex((i) =>
    i.productId.equals(item.productId)
  );

  if (existIndex > -1) {
    // Update quantity
    cart.items[existIndex].quantity += item.quantity || 1;
  } else {
    cart.items.push({ productId: item.productId, quantity: item.quantity || 1 });
  }

  return await cart.save();
};

// get Cart
module.exports.GetCart = async (userId) => {
  return await cartModel
    .findOne({ userId })
    .populate("items.productId", "name price discount images stock");
};

// delete single product from cart
module.exports.RemoveSingleProduct = async ({ userId, productId }) => {
  // find login user cart
  let cart = await cartModel.findOne({ userId });

  if (!cart) throw new Error("Cart Not Found !!");

  // find index number of product based on productId
  const itemIndex = cart.items.findIndex((i) => i.productId.equals(productId));

  if (itemIndex < 0) {
    throw new Error("Item not Found in Cart");
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();
};

// update cart item quantity
module.exports.UpdateQuantity = async ({ userId, productId, quantity }) => {
  const cart = await cartModel.findOne({ userId });
  if (!cart) throw new Error("Cart Not Found !!");

  const item = cart.items.find((i) => i.productId.equals(productId));
  if (!item) throw new Error("Item not Found in Cart");

  item.quantity = quantity;
  await cart.save();
};