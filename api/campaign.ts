
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { title, objective, audience, targetMarket, contentDialect, visualPrefs, productImages } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const parts: any[] = [];
    if (productImages?.length > 0) {
      productImages.forEach((imgBase64: string) => {
        const [mimeInfo, base64Data] = imgBase64.split(',');
        const mimeType = mimeInfo.match(/:(.*?);/)?.[1] || 'image/png';
        parts.push({ inlineData: { data: base64Data.trim(), mimeType } });
      });
    }

    const textInstruction = visualPrefs.customText?.trim() 
      ? `STRICT REQUIREMENT: You MUST include the exact text "${visualPrefs.customText}" in the design_notes.` 
      : `STRICT REQUIREMENT: Do NOT include ANY typography or text in design_notes.`;

    parts.push({ text: `
      System: Senior Creative Director. Task: Plan a 3-post campaign.
      Title: ${title}
      Objective: ${objective}
      Audience: ${audience}
      Market: ${targetMarket}
      Dialect: ${contentDialect}
      Style: ${visualPrefs.artStyle}, ${visualPrefs.visualEffect}
      ${textInstruction}
    `});

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            posts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  post_number: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  caption_ar: { type: Type.STRING },
                  caption_en: { type: Type.STRING },
                  hashtags_ar: { type: Type.STRING },
                  hashtags_en: { type: Type.STRING },
                  cta: { type: Type.STRING },
                  design_notes: { type: Type.STRING },
                },
                required: ["post_number", "title", "caption_ar", "caption_en", "hashtags_ar", "hashtags_en", "cta", "design_notes"],
              },
            },
          },
          required: ["posts"],
        },
      },
    });

    return new Response(response.text, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
