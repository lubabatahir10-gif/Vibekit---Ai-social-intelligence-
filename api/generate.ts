
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "A valid prompt is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    if (!response.text) {
      return res.status(502).json({ error: "Gemini returned an empty response." });
    }

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: "AI request failed. Please try again." });
  }
      }
