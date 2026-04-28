const express = require("express");
const userMiddleware = require("../../../middlewares/user.middleware");
const adminMiddleware = require("../../../middlewares/admin.middleware");
const productController = require("../../../controllers/product.controller");
const router = express.Router();

// featured products - public
router.get("/featured/all", productController.getFeaturedProducts);

// get products by category - public
router.get("/category/:category", productController.getProductsByCategory);

// create product - admin only
router.post(
  "/add",
  userMiddleware.authUser,
  adminMiddleware.authAdmin,
  productController.createProduct
);

// all products with filters - public
router.get("/all", productController.allProduct);

// single product - public
router.get("/:id", productController.singleProduct);

// update product - admin only
router.put(
  "/:id",
  userMiddleware.authUser,
  adminMiddleware.authAdmin,
  productController.updateProduct
);

// delete product - admin only
router.delete(
  "/:id",
  userMiddleware.authUser,
  adminMiddleware.authAdmin,
  productController.deleteProduct
);

module.exports = router;