
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateGeminiResponse = async (message) => {
  try {
    const response = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: message,
    });

    if (!response.output_text) {
      throw new Error("Gemini returned an empty response");
    }

    return response.output_text;
  } catch (error) {
    console.error("Gemini API error:", error.message);
    throw new Error("Failed to generate Gemini response");
  }
};
