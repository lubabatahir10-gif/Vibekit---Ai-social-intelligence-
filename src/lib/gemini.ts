import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("VibeKit: No GEMINI_API_KEY detected in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateAIResponse = async (prompt: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing Gemini API Key. Please add it to your environment variables.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });
    
    if (!response || !response.text) {
      throw new Error("AI returned an empty response. Try a different prompt.");
    }
    
    return response.text;
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    
    const message = error?.message || String(error);
    
    if (message.includes("API_KEY_INVALID") || message.includes("not found") || message.includes("404")) {
      throw new Error("The API key is either invalid or does not have access to this model. Please check your GEMINI_API_KEY.");
    }
    
    if (message.includes("quota") || message.includes("429") || message.includes("resource_exhausted") || message.includes("limit")) {
      throw new Error("Gemini API rate limit reached. If you're using a free-tier key, you might need to wait a minute before trying again.");
    }

    if (message.includes("safety") || message.includes("blocked")) {
      throw new Error("This prompt was filtered for safety. Try rephrasing it.");
    }
    
    throw new Error(`AI Request failed: ${message}`);
  }
};
