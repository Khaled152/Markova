
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { prompt, aspectRatio, productImages } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const parts: any[] = [];
    if (productImages?.length > 0) {
      productImages.forEach((img: string) => {
        const [mimeInfo, base64Data] = img.split(',');
        const mimeType = mimeInfo.match(/:(.*?);/)?.[1] || 'image/png';
        parts.push({ inlineData: { data: base64Data.trim(), mimeType } });
      });
    }

    parts.push({ text: `
      SCENE: ${prompt}
      TECHNICAL: Professional studio lighting, 8k resolution, cinematic.
      EXCLUSION: No text unless explicitly quoted in prompt.
    `});

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio: aspectRatio || '1:1' } },
    });

    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    if (!part) throw new Error('No image generated');

    return new Response(JSON.stringify({ 
      imageUrl: `data:${part.inlineData!.mimeType};base64,${part.inlineData!.data}` 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
