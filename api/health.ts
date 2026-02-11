
export const config = {
  runtime: 'edge',
};

export default async function handler() {
  const isHealthy = !!process.env.API_KEY && process.env.API_KEY.length > 10;
  return new Response(JSON.stringify({ 
    status: isHealthy ? 'online' : 'unauthorized',
    node: 'Vercel Serverless',
    engine: 'Gemini 3.0 Pro + Veo 3.1'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
