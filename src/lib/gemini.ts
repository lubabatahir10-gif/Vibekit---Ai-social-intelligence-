import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  // 1. Try browser environment (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }

  // 2. Try Node-like environment (AI Studio/Development)
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  return null;
};

const apiKey = getApiKey();

if (!apiKey) {
  console.warn("VibeKit: No API key detected. Add VITE_GEMINI_API_KEY to your Vercel Environment Variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const generateAIResponse = async (prompt: string) => {
  if (!apiKey || apiKey === "") {
    throw new Error("Missing API Key. Please add VITE_GEMINI_API_KEY to your Vercel settings and redeploy.");
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
    
    if (message.includes("quota") || message.includes("429")) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }

    if (message.includes("safety") || message.includes("blocked")) {
      throw new Error("This prompt was filtered for safety. Try rephrasing it.");
    }
    
    throw new Error(`AI Request failed: ${message}`);
  }
};
