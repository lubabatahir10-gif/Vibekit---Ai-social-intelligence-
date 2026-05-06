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
      model: "gemini-3.1-flash-lite-preview",
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
    
    if (message.includes("quota") || message.includes("429") || message.includes("limit") || message.includes("resource_exhausted")) {
      throw new Error("Rate limit exceeded for this model. Please wait a moment or try again later.");
    }

    if (message.includes("safety") || message.includes("blocked")) {
      throw new Error("This prompt was filtered for safety. Try rephrasing it.");
    }
    
    throw new Error(`AI Request failed: ${message}`);
  }
};
