const chatService = require("../services/chat.service");

module.exports.botReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(404).json({ message: "Message not Fond !!" });
    }

    // Validate that message is a string (reject files/images)
    if (typeof message !== 'string') {
      return res.status(400).json({ message: "Only text messages are supported" });
    }

    const reply = await chatService.getReply(message);

    res.status(200).json({ reply });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
