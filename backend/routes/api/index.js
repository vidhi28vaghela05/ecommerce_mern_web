const express = require("express");
const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");
const cartRoutes = require("./cart.routes");
const orderRoutes = require("./order.routes");
const adminRoutes = require("./admin.routes");
const paymentRoutes = require("./payment.routes");
const wishlistRoutes = require("./wishlist.routes");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/payments", paymentRoutes);
router.use("/wishlist", wishlistRoutes);

module.exports = router;
