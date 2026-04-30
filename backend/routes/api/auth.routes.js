const express = require("express");
const userController = require("../../controllers/user.controller");
const { authUser } = require("../../middlewares/user.middleware");

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/admin/login", userController.adminLogin);
router.get("/me", authUser, userController.me);
router.put("/me", authUser, userController.updateProfile);
router.post("/logout", userController.logout);

module.exports = router;
