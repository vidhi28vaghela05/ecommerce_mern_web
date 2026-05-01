const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function list() {
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    console.log("Model object created successfully.");
    
    // Actually list models
    // In @google/generative-ai, listing is not directly on the instance sometimes.
    // Let's try to generate a simple content
    const result = await models.generateContent("hi");
    console.log("Response:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}

list();
