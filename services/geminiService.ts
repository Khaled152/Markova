
import { BrandKit, CampaignVisualPrefs } from "../types";

/**
 * Generates a focused 3-post campaign using the secure Serverless API.
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
  const response = await fetch('/api/campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title, objective, audience, brandDetails, targetMarket, contentDialect, visualPrefs, productImages
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Campaign generation failed on server.");
  }

  return response.json();
};

/**
 * Generates a high-quality commercial image using the secure Serverless API.
 */
export const generatePostImage = async (
  prompt: string, 
  aspectRatio: "1:1" | "16:9" | "9:16" = "1:1",
  brand?: BrandKit,
  productImages: string | string[] = []
) => {
  const response = await fetch('/api/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      aspectRatio,
      brand,
      productImages: Array.isArray(productImages) ? productImages : [productImages]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Image generation failed on server.");
  }

  const data = await response.json();
  return data.imageUrl;
};

export const generateStrategicPlan = async (
  brand: BrandKit,
  goals: string,
  targetRegion: string
) => {
  const response = await fetch('/api/strategy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brand, goals, targetRegion })
  });

  if (!response.ok) throw new Error("Strategy generation failed.");
  return response.json();
};
