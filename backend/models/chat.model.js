const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    receiver: {
      type: String, // Can be user ID or 'admin'
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    room: {
      type: String, // Typically the user's ID to keep conversation between user and admin
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    chatType: {
      type: String,
      enum: ["ai", "admin"],
      default: "admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("chatMessage", chatMessageSchema);
