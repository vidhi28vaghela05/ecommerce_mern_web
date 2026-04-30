const express = require("express");
const wishlistController = require("../../controllers/wishlist.controller");
const { authUser } = require("../../middlewares/user.middleware");

const router = express.Router();

router.get("/", authUser, wishlistController.GetWishlist);
router.post("/add", authUser, wishlistController.AddToWishlist);
router.delete("/remove/:id", authUser, wishlistController.RemoveFromWishlist);

module.exports = router;
