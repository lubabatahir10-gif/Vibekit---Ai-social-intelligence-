
export const generateAIResponse = async (prompt: string) => {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI request failed.");
    }

    if (!data.text) {
      throw new Error("AI returned an empty response.");
    }

    return data.text;
  } catch (error: any) {
    console.error("VibeKit AI Error:", error);
    throw new Error(error.message || "Could not connect to VibeKit AI.");
  }
};
  
