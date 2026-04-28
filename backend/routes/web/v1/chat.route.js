const express = require("express");
const router = express.Router();
const userMiddleware = require("../../../middlewares/user.middleware");
const chatController = require("../../../controllers/chat.controller");

// router --> service --> controller --> call into router
router.post("/chat", userMiddleware.authUser, chatController.botReply);

module.exports = router;
