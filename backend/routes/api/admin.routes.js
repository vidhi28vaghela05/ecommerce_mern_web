const express = require("express");
const adminController = require("../../controllers/admin.controller");
const productController = require("../../controllers/product.controller");
const { authUser } = require("../../middlewares/user.middleware");
const { authAdmin } = require("../../middlewares/admin.middleware");
const upload = require("../../middlewares/upload.middleware");

const router = express.Router();

router.use(authUser, authAdmin);

router.get("/dashboard", adminController.dashboard);
router.get("/users", adminController.listUsers);
router.delete("/users/:id", adminController.removeUser);
router.get("/orders", adminController.listOrders);
router.patch("/orders/:id/status", adminController.updateOrderStatus);
router.get("/categories", adminController.listCategories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);
router.post("/products", upload.array("images", 4), productController.createProduct);
router.put("/products/:id", upload.array("images", 4), productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);

module.exports = router;
