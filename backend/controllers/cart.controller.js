const cartService = require("../services/cart.service");

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getOrCreateCart(req.user._id);
    res.json(cartService.getCartSummary(cart));
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const cart = await cartService.addToCart(
      req.user._id,
      req.body.productId,
      req.body.quantity
    );
    res.json({ message: "Item added to cart.", cart });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const cart = await cartService.updateCartItem(
      req.user._id,
      req.params.productId,
      req.body.quantity
    );
    res.json({ message: "Cart updated successfully.", cart });
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeCartItem(req.user._id, req.params.productId);
    res.json({ message: "Item removed from cart.", cart });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
};
