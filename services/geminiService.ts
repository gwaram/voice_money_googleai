import { GoogleGenAI, Type } from "@google/genai";
import { GemniAnalysisResult, TransactionType, Category } from '../types';

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:audio/wav;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeAudioLog = async (audioBlob: Blob): Promise<GemniAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set it in the environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Audio = await blobToBase64(audioBlob);

  const prompt = `
    You are a smart financial assistant. Listen to this audio log (in Korean) for a household account book.
    
    Extract the following details:
    1. Is it an expense or income?
    2. Amount (number only).
    3. Merchant/Store name.
    4. Payment method (Card, Cash, etc.).
    5. Category: Choose strictly from the following list based on the context:
       - 식비 (Food, groceries, snacks)
       - 사업 비용 (Business expenses)
       - 교통/차량 (Transport, fuel, parking, car maintenance)
       - 고정비 (Fixed costs, bills, subscription)
       - 생활/쇼핑 (Living, shopping, beauty, clothes)
       - 여가/외식 (Leisure, dining out, cafe, travel)
       - 건강/의료 (Health, hospital, pharmacy)
       - 교회/교제/경조사 (Relationship, gifts, church, donations)
       - 대출 관련 (Loan, interest)
    6. Subcategory: Be specific (e.g., "Coffee", "Taxi").
    7. Reason/Excuse: Why was this bought? The user's justification.
    8. Emotion: Analyze the voice tone and content to determine the emotion (e.g., Happy, Regretful, Stressed, Neutral).
    9. Daily Diary: Summarize the context into a short diary entry format (1-2 sentences).
    10. Impulse Score: Rate from 1 (Necessary/Planned) to 10 (Impulsive/Wasteful).
    11. Transcript: Transcribe the audio exactly.

    If any field is missing or unclear, infer the most logical value or use reasonable defaults (e.g., amount 0 if not heard).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: audioBlob.type || 'audio/wav',
            data: base64Audio,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: [TransactionType.EXPENSE, TransactionType.INCOME] },
          amount: { type: Type.NUMBER },
          merchant: { type: Type.STRING },
          method: { type: Type.STRING },
          category: { 
            type: Type.STRING, 
            enum: Object.values(Category) 
          },
          subcategory: { type: Type.STRING },
          reason: { type: Type.STRING },
          emotion: { type: Type.STRING },
          diary: { type: Type.STRING },
          impulseScore: { type: Type.NUMBER },
          transcript: { type: Type.STRING },
        },
        required: ['type', 'amount', 'category', 'reason', 'impulseScore', 'transcript'],
      },
    },
  });

  const result = JSON.parse(response.text || '{}');
  
  // Safety fallback for category if model hallucinates slightly different string
  if (!Object.values(Category).includes(result.category)) {
      result.category = Category.UNCATEGORIZED;
  }

  return result as GemniAnalysisResult;
};