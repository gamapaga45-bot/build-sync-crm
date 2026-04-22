import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  async rewriteProfessionally(text: string): Promise<string> {
    if (!text || text.trim().length < 5) return text;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Перепиши следующий текст для профессионального строительного журнала работ (daily log). 
        Текст должен быть лаконичным, технически грамотным и соответствовать стандартам строительной документации.
        Используй профессиональную терминологию.
        
        Текст для переработки:
        "${text}"`,
      });

      return response.text || text;
    } catch (error) {
      console.error("Gemini rewrite error:", error);
      return text;
    }
  },

  async rewriteDefectDescription(text: string): Promise<string> {
    if (!text || text.trim().length < 5) return text;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Перепиши следующее описание строительного дефекта для официального отчета технадзора. 
        Текст должен быть строгим, технически точным, использовать профессиональную терминологию (например, вместо "дырка" - "технологическое отверстие" или "каверна").
        Укажи на характер нарушения, если это возможно из контекста.
        
        Описание дефекта:
        "${text}"`,
      });

      return response.text || text;
    } catch (error) {
      console.error("Gemini defect rewrite error:", error);
      return text;
    }
  }
};
