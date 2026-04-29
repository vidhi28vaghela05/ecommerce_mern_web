const wishlistModel = require("../models/wishlist.model");
const productModel = require("../models/product.model"); // Ensure product model is registered

// add items into wishlist
module.exports.AddToWishlist = async ({ userId, productId }) => {
  try {
    let wishlist = await wishlistModel.findOne({ userId });

    if (!wishlist) {
      wishlist = new wishlistModel({ userId, productIds: [] });
    }

    // Check if already in wishlist (handles both ObjectId and string)
    const exists = wishlist.productIds.some(
      (id) => id.toString() === productId.toString()
    );
    if (exists) {
      throw new Error("Product already in wishlist");
    }

    wishlist.productIds.push(productId);
    const result = await wishlist.save();

    // Return populated wishlist
    const populatedWishlist = await wishlistModel
      .findOne({ _id: result._id })
      .populate("productIds");

    return populatedWishlist;
  } catch (error) {
    console.error("AddToWishlist error:", error);
    throw error;
  }
};

// get wishlist
module.exports.GetWishlist = async (userId) => {
  try {
    const wishlist = await wishlistModel
      .findOne({ userId })
      .populate("productIds");

    console.log("Fetched wishlist for", userId, ":", JSON.stringify(wishlist, null, 2));

    if (!wishlist || !wishlist.productIds || wishlist.productIds.length === 0) {
      return null;
    }

    // Filter out any null products (in case referenced product was deleted)
    const validProducts = wishlist.productIds.filter(p => p != null);
    if (validProducts.length === 0) return null;

    // Return a plain object with clean array
    return {
      _id: wishlist._id,
      userId: wishlist.userId,
      productIds: validProducts,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt
    };
  } catch (error) {
    console.error("GetWishlist error:", error);
    throw error;
  }
};

// remove item from wishlist
module.exports.RemoveFromWishlist = async ({ userId, productId }) => {
  let wishlist = await wishlistModel.findOne({ userId });

  if (!wishlist) throw new Error("Wishlist Not Found !!");

  wishlist.productIds = wishlist.productIds.filter(
    (id) => id.toString() !== productId.toString()
  );

  const result = await wishlist.save();
  return result;
};