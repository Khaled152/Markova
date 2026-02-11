
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { brand, goals, targetRegion } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const prompt = `
      Task: Create a 12-month strategic plan.
      Brand: ${brand.name} (${brand.industry})
      Goals: ${goals}
      Region: ${targetRegion}
      Output: JSON format including SWOT, competitors, roadmap, and audience personas.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
      },
    });

    return new Response(response.text, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
