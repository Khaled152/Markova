
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const url = new URL(req.url);

  // Status Check (GET /api/video?id=...)
  if (req.method === 'GET') {
    const opId = url.searchParams.get('id');
    if (!opId) return new Response('Missing operation ID', { status: 400 });
    
    const operation = await ai.operations.getVideosOperation({ operation: { name: opId } as any });
    return new Response(JSON.stringify(operation), { headers: { 'Content-Type': 'application/json' } });
  }

  // Start Generation (POST /api/video)
  if (req.method === 'POST') {
    try {
      const { model, prompt, config, image, lastFrame, referenceImages } = await req.json();
      const payload: any = { model, prompt, config };
      if (image) payload.image = image;
      if (lastFrame) payload.lastFrame = lastFrame;
      if (referenceImages) payload.referenceImages = referenceImages;

      const operation = await ai.models.generateVideos(payload);
      return new Response(JSON.stringify(operation), { headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
