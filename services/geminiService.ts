import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  /**
   * Analyzes a receipt image and extracts transaction details.
   */
  parseReceipt: async (base64Image: string): Promise<{ amount: number; category: string; description: string; date: string; currency?: string } | null> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            },
            {
              text: `Analyze this receipt. Extract:
              1. Total amount (number only).
              2. Merchant name (as description).
              3. Date (YYYY-MM-DD).
              4. Category from: ${Object.values(Category).join(', ')}.
              5. Currency code (e.g. TJS, UZS, USD, RUB). If unsure, guess based on location/language or omit.
              
              Return a raw JSON object with keys: "amount", "description", "category", "date", "currency".
              Do not use markdown formatting or code blocks.`
            }
          ]
        }
        // NOTE: responseMimeType and responseSchema are NOT supported on gemini-2.5-flash-image
      });

      let text = response.text;
      if (text) {
        // Clean up markdown if the model includes it (e.g. ```json ... ```)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini receipt scan:", text);
            return null;
        }
      }
      return null;
    } catch (error) {
      console.error("Gemini Receipt Error:", error);
      throw error;
    }
  },

  /**
   * Parses natural language text into a structured transaction.
   */
  parseVoiceCommand: async (text: string): Promise<{ amount: number; category: string; description: string } | null> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract transaction details from this text: "${text}".
        Map the category to one of: ${Object.values(Category).join(', ')}.
        If no category fits, use 'Other'.
        Return JSON.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              description: { type: Type.STRING },
              category: { type: Type.STRING }
            }
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
      return null;
    } catch (error) {
      console.error("Gemini Voice Error:", error);
      throw error;
    }
  },

  /**
   * Provides financial advice based on user data.
   */
  getFinancialAdvice: async (
    query: string,
    context: string,
    history: { role: string; parts: { text: string }[] }[]
  ): Promise<string> => {
    try {
      const model = 'gemini-3-flash-preview';
      
      // Construct the conversation history for context
      // We prepend a system-like message to the user prompt if it's a fresh chat, 
      // or rely on the context string injected into the prompt.
      
      const fullPrompt = `
      Context: ${context}
      
      User Question: ${query}
      
      You are a wise, helpful financial advisor using principles from "Rich Dad Poor Dad" and common sense financial literacy. 
      Be concise, encouraging, and practical. 
      Focus on reducing liabilities and increasing assets or savings.
      Format the response with Markdown.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: fullPrompt
      });

      return response.text || "I couldn't generate advice at this moment.";
    } catch (error) {
      console.error("Gemini Advice Error:", error);
      return "Sorry, I'm having trouble connecting to the financial brain right now.";
    }
  }
};