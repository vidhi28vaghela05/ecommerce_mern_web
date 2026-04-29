const wishlistService = require("../services/wishlist.service");

// add item to wishlist
module.exports.AddToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const wishlist = await wishlistService.AddToWishlist({ userId, productId });

    return res
      .status(200)
      .json({ message: "Added to wishlist successfully", wishlist });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get wishlist
module.exports.GetWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await wishlistService.GetWishlist(userId);

    if (!wishlist) {
      return res.status(200).json({ message: "Wishlist is empty", wishlist: null });
    }

    return res
      .status(200)
      .json({ message: "Wishlist fetched successfully", wishlist });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// remove item from wishlist
module.exports.RemoveFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id; // Get productId from URL params

    await wishlistService.RemoveFromWishlist({ userId, productId });

    return res
      .status(200)
      .json({ message: "Removed from wishlist successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};