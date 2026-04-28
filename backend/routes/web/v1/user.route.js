const express = require("express");
const { body } = require("express-validator");
const userController = require("../../../controllers/user.controller");
const middleware = require("../../../middlewares/user.middleware");

const router = express.Router();

// register user
// second validation -- use express validator package
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 4 })
      .withMessage("username must be 4 characters long"),
    body("email").isEmail().withMessage("Enter Vaild Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be 6 characters long"),
  ],
  userController.registerUser,
);

// login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter Vaild Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be 6 charcters long"),
  ],
  userController.loginUser,
);

// show profile
router.get("/profile", middleware.authUser, userController.profile);

// logout profile
router.get("/logout", middleware.authUser, userController.logout)

// update profile
router.put("/update", middleware.authUser, userController.updateUser)

// forget password
router.post("/forget-password", userController.forgetPassword)

// reset password
router.post("/reset-password/:token", userController.resetPassword)

module.exports = router;
