const ChatMessage = require("../models/chat.model");

let GoogleGenAI;
try {
  const genai = require("@google/genai");
  GoogleGenAI = genai.GoogleGenAI;
} catch (e) {
  console.warn("Google GenAI not installed, AI chatbot will be disabled.");
}

// ─── System Instruction ───────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `You are LuxeBot, a highly intelligent and friendly AI assistant for LuxeCart — a premium online e-commerce store.

Your primary goal is to provide exceptional customer support for LuxeCart, but you are also capable of answering ANY general question about the world (history, science, geography, food, technology, etc.) with accuracy and charm.

When helping with LuxeCart:
- Answer questions about orders, tracking, shipping, returns, and payments.
- Provide product advice and shopping recommendations.
- Key facts: Free shipping over $15, 3-5 days delivery, 30-day returns.
- Customer support email: support@luxecart.com

When answering general questions:
- Be informative, accurate, and helpful.
- Maintain your LuxeBot identity (warm and professional).

Identity Guidelines:
- Name: LuxeBot
- Voice: Warm, helpful, and professional.
- Style: Concise (2-4 sentences max). Use emojis occasionally. 😊🛒

Never say "I can only help with shopping". If a user asks a question about anything in the world, answer it helpfully and politely!`;

// ─── Database Operations ──────────────────────────────────────────────────────
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

const getChatHistory = async (room, chatType = "admin") => {
  try {
    return await ChatMessage.find({ room, chatType })
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
      { $match: { chatType: "admin" } },
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
      {
        $addFields: {
          roomUserId: { $toObjectId: "$_id" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "roomUserId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastTimestamp: 1,
          unreadCount: 1,
          userName: "$user.name",
          userEmail: "$user.email",
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

// ─── Fallback Static Bot ──────────────────────────────────────────────────────
const getStaticReply = (message) => {
  const text = message.toLowerCase();

  if (text.includes("hi") || text.includes("hello") || text.includes("hey") || text.includes("hii")) {
    return "Hello! 👋 Welcome to LuxeCart support. How can I help you today?";
  }
  if (text.includes("order") || text.includes("track")) {
    return "You can track your order in the Orders section of your profile. If you have a specific issue, please share your order ID!";
  }
  if (text.includes("payment") || text.includes("refund")) {
    return "For payment or refund issues, go to Orders and request a refund, or contact us at support@luxecart.com.";
  }
  if (text.includes("return") || text.includes("exchange")) {
    return "We offer a 30-day hassle-free return policy for all unworn and unused items. Visit the Orders section to initiate a return.";
  }
  if (text.includes("shipping") || text.includes("delivery")) {
    return "Standard delivery takes 3-5 business days. International orders take 7-14 days. Express shipping is available at checkout! 🚀";
  }
  if (text.includes("price") || text.includes("discount") || text.includes("offer") || text.includes("deal")) {
    return "Check out our Offers section on the Shop page for the latest deals and discounts! 🎉";
  }
  if (text.includes("contact") || text.includes("help") || text.includes("support")) {
    return "You can reach us at support@luxecart.com or use the Contact Us page. We're available Mon-Sat, 9am-6pm.";
  }
  if (text.includes("bye") || text.includes("thanks") || text.includes("thank you") || text.includes("goodbye")) {
    return "You're welcome! Happy shopping at LuxeCart! 😊 Feel free to ask if you need anything else.";
  }

  return "I'm LuxeBot, your LuxeCart shopping assistant! I can help with orders, shipping, returns, and payments. What do you need help with? 🛒";
};

// ─── AI Bot (Gemini) ──────────────────────────────────────────────────────────
const getAiReply = async (message, roomHistory = []) => {
  try {
    if (!GoogleGenAI || !process.env.GEMINI_API_KEY) return null;

    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

    // Build conversation history for context (last 10 messages only)
    const historyContents = roomHistory.slice(-10).map((msg) => ({
      role: String(msg.sender) === "admin" ? "model" : "user",
      parts: [{ text: msg.message }],
    }));

    // Add current user message
    historyContents.push({ role: "user", parts: [{ text: message }] });

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    const result = await model.generateContent({
      contents: historyContents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });

    const text = result.response.text();
    return text ? text.trim() : null;
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return null;
  }
};

// ─── Main Entry ───────────────────────────────────────────────────────────────
const getReply = async (message, roomHistory = []) => {
  try {
    const aiReply = await getAiReply(message, roomHistory);
    if (aiReply) return aiReply;
    return getStaticReply(message);
  } catch (error) {
    console.error("getReply error:", error);
    return getStaticReply(message);
  }
};

module.exports = {
  saveMessage,
  getChatHistory,
  getActiveConversations,
  getReply,
};
