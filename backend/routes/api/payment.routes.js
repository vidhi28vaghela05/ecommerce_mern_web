const express = require("express");
const paymentController = require("../../controllers/payment.controller");
const { authUser } = require("../../middlewares/user.middleware");

const router = express.Router();

router.post("/create-checkout-session", authUser, paymentController.createCheckoutSession);
router.get("/verify-payment", authUser, paymentController.verifyPayment);

module.exports = router;
