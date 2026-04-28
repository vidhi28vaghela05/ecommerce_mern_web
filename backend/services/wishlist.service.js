const wishlistModel = require("../models/wishlist.model");

// add items into wishlist
module.exports.AddToWishlist = async ({ userId, productId }) => {
  let wishlist = await wishlistModel.findOne({ userId });

  if (!wishlist) wishlist = new wishlistModel({ userId, productIds: [] });

  // Check if already in wishlist
  const exists = wishlist.productIds.some((id) => id.equals(productId));
  if (exists) {
    throw new Error("Product already in wishlist");
  }

  wishlist.productIds.push(productId);
  const result = await wishlist.save();

  return await wishlistModel
    .findOne({ _id: result._id })
    .populate("productIds");
};

// get wishlist
module.exports.GetWishlist = async (userId) => {
  const wishlist = await wishlistModel
    .findOne({ userId })
    .populate("productIds");

  if (!wishlist) {
    return null;
  }
  return wishlist;
};

// remove item from wishlist
module.exports.RemoveFromWishlist = async ({ userId, productId }) => {
  let wishlist = await wishlistModel.findOne({ userId });

  if (!wishlist) throw new Error("Wishlist Not Found !!");

  wishlist.productIds = wishlist.productIds.filter(
    (id) => !id.equals(productId)
  );

  const result = await wishlist.save();
  return result;
};