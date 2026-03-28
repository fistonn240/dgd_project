import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const agriAI = {
  async diagnoseCrop(imageBase64: string) {
    const model = "gemini-3-flash-preview";
    const result = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: "You are an expert African agronomist. Analyze this crop image. Identify the plant, diagnose any diseases or pests, and provide specific, organic, and cost-effective treatment advice suitable for smallholder farmers in Africa. Format your response in clear Markdown." },
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
          ]
        }
      ]
    });
    return result.text;
  },

  async getFarmingAdvice(query: string) {
    const model = "gemini-3-flash-preview";
    const result = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        systemInstruction: "You are AgriSmart AI, a helpful assistant for African farmers. Provide practical, sustainable, and climate-smart agricultural advice. Focus on local crops like maize, cassava, cocoa, and coffee. Use simple language and metric units."
      }
    });
    return result.text;
  }
};
