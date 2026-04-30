const express = require("express");
const productController = require("../../controllers/product.controller");
const { authUser } = require("../../middlewares/user.middleware");
const { authAdmin } = require("../../middlewares/admin.middleware");
const upload = require("../../middlewares/upload.middleware");

const router = express.Router();

router.get("/", productController.listProducts);
router.get("/featured", productController.featuredProducts);
router.get("/:id", productController.getProduct);
router.post("/", authUser, authAdmin, upload.array("images", 4), productController.createProduct);
router.put("/:id", authUser, authAdmin, upload.array("images", 4), productController.updateProduct);
router.delete("/:id", authUser, authAdmin, productController.deleteProduct);

module.exports = router;
