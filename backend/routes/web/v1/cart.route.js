const express = require("express");
const router = express.Router();
const userMiddleware = require("../../../middlewares/user.middleware");
const cartController = require("../../../controllers/cart.controller");

// add items
router.post("/add", userMiddleware.authUser, cartController.AddToCart);

// get all items
router.get("/all", userMiddleware.authUser, cartController.GetCart);

// update quantity
router.put("/product/:id", userMiddleware.authUser, cartController.UpdateQuantity);

// remove single item from cart
router.delete("/product/:id", userMiddleware.authUser, cartController.RemoveItem);

module.exports = router;