const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getOrCreateCart } = require("../services/cart.service");
const Product = require("../models/product.model");
const orderService = require("../services/order.service");

const createCheckoutSession = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress) {
      throw new Error("Shipping address is required.");
    }

    const cart = await getOrCreateCart(req.user._id);
    if (!cart.items.length) {
      throw new Error("Your cart is empty.");
    }

    const line_items = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product || !product.isActive) continue;
      
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });
    }

    // Add shipping fee as a line item if applicable
    const subtotal = cart.items.reduce((sum, item) => {
        const price = item.product.price || 0;
        return sum + (price * item.quantity);
    }, 0);
    const shippingFee = subtotal > 1000 ? 0 : 99;
    if (shippingFee > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping Fee",
          },
          unit_amount: Math.round(shippingFee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#cart`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user._id.toString(),
        shippingAddress: JSON.stringify(shippingAddress),
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      throw new Error("Session ID is required.");
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      const Order = require("../models/order.model");
      const existingOrder = await Order.findOne({ stripeSessionId: session_id });
      
      if (existingOrder) {
        return res.json({ message: "Order already processed.", order: existingOrder });
      }

      const shippingAddress = JSON.parse(session.metadata.shippingAddress);
      
      // Use createOrder service
      const order = await orderService.createOrder(req.user, shippingAddress);
      order.paymentMethod = "Stripe";
      order.stripeSessionId = session_id;
      order.paymentStatus = "paid";
      await order.save();

      res.json({ message: "Payment verified and order created.", order });
    } else {
      res.status(400).json({ message: "Payment not completed." });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSession,
  verifyPayment,
};