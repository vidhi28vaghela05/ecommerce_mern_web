const stripe = require("../config/stripe.config");
const orderService = require("../services/order.service");

// Create payment intent
module.exports.CreatePaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "inr" } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (paise for INR)
      currency,
      metadata: {
        userId: req.user.id,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Confirm payment (called after payment succeeds)
module.exports.ConfirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Update order with payment details
      await orderService.UpdateOrderPayment(orderId, paymentIntentId, "paid");

      return res.status(200).json({
        message: "Payment confirmed",
        order: await orderService.GetOrderById(orderId),
      });
    }

    res.status(400).json({ message: "Payment not successful" });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Stripe webhook handler
module.exports.HandleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_your_test_webhook_secret";

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await orderService.UpdateOrderPayment(orderId, paymentIntent.id, "paid");
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await orderService.UpdateOrderPayment(orderId, paymentIntent.id, "failed");
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};