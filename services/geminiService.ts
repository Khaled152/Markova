
import { GoogleGenAI, Type } from "@google/genai";
import { BrandKit, CampaignVisualPrefs } from "../types";

/**
 * Generates a focused 3-post campaign using Gemini 3 Pro.
 */
export const generateCampaignContent = async (
  title: string,
  objective: string,
  audience: string,
  brandDetails: any,
  targetMarket: string,
  contentDialect: string,
  visualPrefs: CampaignVisualPrefs,
  productImages: string[] = []
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';

  const parts: any[] = [];

  if (productImages.length > 0) {
    productImages.forEach((imgBase64) => {
      try {
        const [mimeInfo, base64Data] = imgBase64.split(',');
        const mimeType = mimeInfo.match(/:(.*?);/)?.[1] || 'image/png';
        parts.push({
          inlineData: { data: base64Data.trim(), mimeType }
        });
      } catch (e) {
        console.warn("Skipping malformed image");
      }
    });
  }

  // Mandatory logic for the text overlay
  const textInstruction = visualPrefs.customText && visualPrefs.customText.trim().length > 0
    ? `IMPORTANT: You MUST include the instruction 'Render the text "${visualPrefs.customText.trim()}" clearly and legibly as a graphic overlay' in the design_notes for EVERY post.`
    : `STRICT: Do NOT include any instructions for text or typography in the design_notes. The image should be purely visual with no text.`;

  const prompt = `
    System Role: You are a Senior Creative Director.
    Task: Plan a 3-post viral social media campaign.
    
    VISUAL STYLE GUIDE:
    - Art Medium: ${visualPrefs.artStyle}
    - Human Presence: ${visualPrefs.includeCharacter ? 'Include a human character' : 'No humans, product only'}
    - Lighting/Effect: ${visualPrefs.visualEffect}
    - Graphics: ${visualPrefs.addedShapes !== 'None' ? `Include ${visualPrefs.addedShapes} shapes` : 'No extra shapes'}
    - Footer: ${visualPrefs.addFooterShape ? 'Include a solid footer bar for branding' : 'No footer bar'}
    
    ${textInstruction}
    
    Market: ${targetMarket}
    Language: ${contentDialect} Arabic & English
    
    Requirements:
    Generate detailed "design_notes" for an image AI. 
    Ensure the design_notes strictly follow the Style Guide above.
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model,
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

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

/**
 * Generates a high-quality commercial image.
 */
export const generatePostImage = async (
  prompt: string, 
  aspectRatio: "1:1" | "16:9" | "9:16" = "1:1",
  brand?: BrandKit,
  productImages: string | string[] = []
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash-image';
  
  const parts: any[] = [];
  const imagesArray = Array.isArray(productImages) ? productImages : [productImages];

  if (imagesArray.length > 0) {
    imagesArray.forEach((img) => {
      if (!img) return;
      try {
        const [mimeInfo, base64Data] = img.split(',');
        const mimeType = mimeInfo.match(/:(.*?);/)?.[1] || 'image/png';
        parts.push({
          inlineData: { data: base64Data.trim(), mimeType }
        });
      } catch (e) {
        console.warn("Malformed image part skipped.");
      }
    });
  }

  // Final prompt tuning for the image model
  let instructions = `SCENE: ${prompt}.\n`;
  
  // High-fidelity text instruction
  if (prompt.includes('"')) {
    instructions += `TYPOGRAPHY: Identify the text in quotes within the scene description and render it exactly, legibly, and beautifully in a clean commercial font. Ensure no spelling errors.\n`;
  } else {
    instructions += `STRICT: Do NOT include any text, letters, or numbers in the image unless they are physically part of the product label.\n`;
  }

  if (brand) {
    instructions += `COLOR SCHEME: Use ${brand.primary_color} and ${brand.secondary_color} accents.\n`;
  }
  
  instructions += `QUALITY: 8k resolution, professional studio photography, cinematic bokeh, masterpiece.`;

  parts.push({ text: instructions });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        imageConfig: { aspectRatio },
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Image synthesis failed.");
  } catch (error: any) {
    console.error("Gemini Visual Generation Failed:", error);
    throw error;
  }
};

/**
 * Generates a full Marketing Strategic Plan.
 */
export const generateStrategicPlan = async (
  brand: BrandKit,
  goals: string,
  targetRegion: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';

  const prompt = `
    Task: Create a 12-month Strategic Marketing Plan for "${brand.name}".
    Context: Goals: ${goals}, Region: ${targetRegion}.
    Format: JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            swot: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["strengths", "weaknesses", "opportunities", "threats"],
            },
            competitors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  advantage: { type: Type.STRING },
                  vulnerability: { type: Type.STRING },
                },
                required: ["name", "advantage", "vulnerability"],
              },
            },
            audience_personas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  pain_points: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ideal_solution: { type: Type.STRING },
                },
                required: ["name", "pain_points", "ideal_solution"],
              },
            },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["month", "focus", "tasks"],
              },
            },
          },
          required: ["swot", "competitors", "audience_personas", "roadmap"],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Strategic Planning Error:", error);
    throw error;
  }
};
