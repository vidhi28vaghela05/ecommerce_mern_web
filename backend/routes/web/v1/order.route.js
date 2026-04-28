const express = require("express");
const router = express.Router();
const userMiddleware = require("../../../middlewares/user.middleware");
const adminMiddleware = require("../../../middlewares/admin.middleware");
const orderController = require("../../../controllers/order.controller");

// create order
router.post("/add", userMiddleware.authUser, orderController.CreateOrder);

// get order - show history or recent order
router.get("/all", userMiddleware.authUser, orderController.GetOrder);

// get all orders (admin)
router.get(
  "/admin/all",
  userMiddleware.authUser,
  adminMiddleware.authAdmin,
  orderController.GetAllOrders
);

// get single order
router.get(
  "/:id",
  userMiddleware.authUser,
  orderController.GetSingleOrder
);

// update order status (admin)
router.put(
  "/:id/status",
  userMiddleware.authUser,
  adminMiddleware.authAdmin,
  orderController.UpdateOrderStatus
);

// cancel order
router.delete("/:id", userMiddleware.authUser, orderController.CancelOrder);

module.exports = router;