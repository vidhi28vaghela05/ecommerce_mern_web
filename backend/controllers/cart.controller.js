const cartModel = require("../models/cart.model");
const cartService = require("../services/cart.service");

// Add To Cart
module.exports.AddToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item } = req.body;

    let Exist = await cartModel.findOne({ userId });

    const cart = await cartService.addToCart({ userId, item });

    return res
      .status(200)
      .json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get Cart
module.exports.GetCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await cartService.GetCart(userId);

    if (!cart) {
      return res.status(200).json({ message: "Cart is empty", cart: null });
    }

    return res.status(200).json({ message: "Cart fetched successfully", cart });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// remove single item from cart
module.exports.RemoveItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    await cartService.RemoveSingleProduct({ userId, productId });

    return res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// update cart item quantity
module.exports.UpdateQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    await cartService.UpdateQuantity({ userId, productId, quantity });

    const cart = await cartService.GetCart(userId);
    return res
      .status(200)
      .json({ message: "Quantity updated successfully", cart });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};