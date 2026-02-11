
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
  // Use process.env.API_KEY directly
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

  const hasCustomText = visualPrefs.customText && visualPrefs.customText.trim().length > 0;
  const textInstruction = hasCustomText
    ? `STRICT REQUIREMENT: You MUST include the exact text "${visualPrefs.customText?.trim()}" in the design_notes for EVERY post. Explicitly state: 'Render the text "${visualPrefs.customText?.trim()}" in a bold, clean commercial font as a graphic overlay.'`
    : `STRICT REQUIREMENT: Do NOT include ANY text, letters, slogans, or characters in the design_notes. The scene must be PURELY visual and clean of any typography.`;

  const prompt = `
    System Role: Senior Creative Director.
    Task: Plan a 3-post social media campaign.
    
    VISUAL STYLE GUIDE:
    - Art Medium: ${visualPrefs.artStyle}
    - Character: ${visualPrefs.includeCharacter ? 'Include a human character' : 'No humans, focus only on the product'}
    - Effect: ${visualPrefs.visualEffect}
    - Shapes: ${visualPrefs.addedShapes !== 'None' ? `Incorporate ${visualPrefs.addedShapes} graphics` : 'Clean composition, no extra shapes'}
    - Branding: ${visualPrefs.addFooterShape ? 'Include a stylized brand footer at the bottom' : 'No footer bar'}
    
    ${textInstruction}
    
    Market: ${targetMarket}
    Language: ${contentDialect} (Captions in both Arabic & English)
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
 * Generates a high-quality commercial image using Gemini 2.5 Flash Image.
 */
export const generatePostImage = async (
  prompt: string, 
  aspectRatio: "1:1" | "16:9" | "9:16" = "1:1",
  brand?: BrandKit,
  productImages: string | string[] = []
) => {
  // Use process.env.API_KEY directly
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

  const hasTextInPrompt = prompt.includes('"');
  let instructions = `SCENE: ${prompt}.\n`;
  if (hasTextInPrompt) {
    instructions += `TYPOGRAPHY: Identify the text in quotes and render it exactly and legibly. High-end commercial font only.\n`;
  } else {
    instructions += `STRICT EXCLUSION: Do NOT render any text, characters, letters, or gibberish. No labels, no watermarks, no typography. The image must be purely visual.\n`;
  }

  if (brand) {
    instructions += `BRANDING: Use ${brand.primary_color} and ${brand.secondary_color} as the primary color accents.\n`;
  }
  
  instructions += `TECHNICAL: Professional studio lighting, 8k resolution, cinematic composition.`;
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

export const generateStrategicPlan = async (
  brand: BrandKit,
  goals: string,
  targetRegion: string
) => {
  // Use process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  const prompt = `Task: Create a strategic plan for ${brand.name}. Goals: ${goals}. Region: ${targetRegion}. JSON output.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Strategy Error:", error);
    throw error;
  }
};
