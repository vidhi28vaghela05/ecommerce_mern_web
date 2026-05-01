const ChatMessage = require("../models/chat.model");
let GoogleGenAI;
try {
  GoogleGenAI = require("@google/genai").GoogleGenAI;
} catch (e) {
  console.warn("Google GenAI not installed, AI chatbot will be disabled.");
}

// Database Operations
const saveMessage = async (data) => {
  try {
    const message = new ChatMessage(data);
    await message.save();
    return message;
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }
};

const getChatHistory = async (room) => {
  try {
    return await ChatMessage.find({ room })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};

const getActiveConversations = async () => {
  try {
    const conversations = await ChatMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$room",
          lastMessage: { $first: "$message" },
          lastTimestamp: { $first: "$createdAt" },
          unreadCount: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
          },
        },
      },
      { $sort: { lastTimestamp: -1 } },
    ]);
    return conversations;
  } catch (error) {
    console.error("Error fetching active conversations:", error);
    throw error;
  }
};

// Rule Base Bot --> Static Reply
const getStaticReply = (message) => {
  const text = message.toLowerCase();

  if (text.includes("hi") || text.includes("hello") || text.includes("hey")) {
    return "Hello! How can I help you today?";
  }

  if (text.includes("name")) {
    return "I am your virtual assistant. You can call me ChatBot.";
  }

  if (text.includes("help") || text.includes("support")) {
    return "Sure! I can help you with orders, payments, and general questions.";
  }

  if (text.includes("order") || text.includes("track")) {
    return "Please provide your order ID so I can check the status.";
  }

  if (text.includes("payment") || text.includes("refund")) {
    return "I can help you with payment or refund issues. Please share details.";
  }

  if (text.includes("bye") || text.includes("goodbye")) {
    return "Goodbye! Have a great day 😊";
  }

  return "I didn't understand that.";
};

// AI Chat Bot
const getAiReply = async (message) => {
  try {
    if (!process.env.GEMINI_API_KEY) return null;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemInstruction = "You are a helpful customer support assistant for an e-commerce website called LuxeCart. Keep answers concise, helpful and polite.";
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: `${systemInstruction}\nUser: ${message}` }] }],
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error.message);
    if (error.message && (error.message.includes("image") || error.message.includes("unsupported"))) {
      return "I'm sorry, I can only process text messages. Please don't send images or files.";
    }
    return null;
  }
};

const getReply = async (message) => {
  try {
    const aiReply = await getAiReply(message);
    if (aiReply) return aiReply;
    return getStaticReply(message);
  } catch (error) {
    console.log(error);
    return getStaticReply(message);
  }
};

module.exports = {
  saveMessage,
  getChatHistory,
  getActiveConversations,
  getReply,
};

