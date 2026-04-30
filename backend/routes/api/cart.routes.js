const express = require("express");
const cartController = require("../../controllers/cart.controller");
const { authUser } = require("../../middlewares/user.middleware");

const router = express.Router();

router.use(authUser);
router.get("/", cartController.getCart);
router.post("/", cartController.addItem);
router.put("/:productId", cartController.updateItem);
router.delete("/:productId", cartController.removeItem);

module.exports = router;
