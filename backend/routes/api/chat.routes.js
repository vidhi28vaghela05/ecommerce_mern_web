const express = require("express");
const router = express.Router();
const chatService = require("../../services/chat.service");
const { authUser } = require("../../middlewares/user.middleware");
const { authAdmin } = require("../../middlewares/admin.middleware");

// Get chat history for a room
router.get("/history/:room", authUser, async (req, res) => {
  try {
    const history = await chatService.getChatHistory(req.params.room);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active conversations (Admin only)
router.get("/conversations", authUser, authAdmin, async (req, res) => {
  try {
    const conversations = await chatService.getActiveConversations();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
