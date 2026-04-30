const { GoogleGenAI } = require("@google/genai");

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
    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error.message);
    // Check if it's an image-related error
    if (error.message && (error.message.includes("image") || error.message.includes("unsupported"))) {
      return "I'm sorry, I can only process text messages. Please don't send images or files.";
    }
    throw error; // Re-throw other errors
  }
};

module.exports.getReply = async (message) => {
  try {
    return await getAiReply(message)
    // return getStaticReply(message);
  } catch (error) {
    console.log(error);
    return getStaticReply(message);
  }
};
