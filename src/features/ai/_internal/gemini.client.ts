import { GoogleGenAI } from "@google/genai";

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || undefined;
}

export function hasGeminiApiKey(): boolean {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 5);
}

export async function callGemini(
  prompt: string,
  options: {
    model?: string;
    systemInstruction?: string;
  } = {}
): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = options.model || "gemini-1.5-flash";

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: options.systemInstruction
        ? {
            systemInstruction: options.systemInstruction,
          }
        : undefined,
    });

    return response.text || null;
  } catch (error) {
    console.warn("[GeminiClient] API call failed, falling back to heuristic engine:", error);
    return null;
  }
}
