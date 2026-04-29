const express = require("express");
const router = express.Router();
const userMiddleware = require("../../../middlewares/user.middleware");
const paymentController = require("../../../controllers/payment.controller");

// Create payment intent
router.post("/create", userMiddleware.authUser, paymentController.CreatePaymentIntent);

// Confirm payment
router.post("/confirm", userMiddleware.authUser, paymentController.ConfirmPayment);

// Stripe webhook
router.post("/webhook", paymentController.HandleWebhook);

module.exports = router;