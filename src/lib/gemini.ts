import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set. Please check your secrets.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "YOUR_API_KEY_HERE" });

export const generateAIResponse = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};
