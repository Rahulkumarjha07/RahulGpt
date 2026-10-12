import "dotenv/config";
import { generateGeminiResponse } from "../services/geminiService.js";

const testGemini = async () => {
  try {
    const response = await generateGeminiResponse(
      "Hello RahulGPT! Introduce yourself in one sentence."
    );

    console.log("\nGemini response:\n");
    console.log(response);

    process.exit(0);
  } catch (error) {
    console.error("Gemini test error:", error.message);
    process.exit(1);
  }
};

testGemini();