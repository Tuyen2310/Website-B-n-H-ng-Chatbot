const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function testGemini() {
  try {
    const envPath = path.join(__dirname, '..', 'backend', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    
    if (!match || !match[1]) {
      console.error("Could not find GEMINI_API_KEY in .env");
      return;
    }
    
    const apiKey = match[1].replace(/["']/g, "").trim();
    console.log(`Testing API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Xin chào, bạn là ai?";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Success! Response:");
    console.log(text);
  } catch (error) {
    console.error("Error testing Gemini API:");
    console.error(error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

testGemini();
