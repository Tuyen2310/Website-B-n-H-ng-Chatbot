const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = 'AIzaSyA5RwvBBAWmq1jWxZOgNpNIwt7JX6o1-7M';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There is no direct listModels in the client, but we can try a known old model
    console.log("Checking connectivity...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("Success:", result.response.text());
  } catch (error) {
    console.error("DETAILED ERROR:");
    console.error("Message:", error.message);
    if (error.stack) console.error("Stack:", error.stack);
  }
}

listModels();
