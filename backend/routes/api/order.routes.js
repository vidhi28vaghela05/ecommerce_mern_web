const express = require("express");
const orderController = require("../../controllers/order.controller");
const { authUser } = require("../../middlewares/user.middleware");

const router = express.Router();

router.use(authUser);
router.get("/", orderController.listMyOrders);
router.post("/checkout", orderController.checkout);

module.exports = router;
