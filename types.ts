
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface PlanFeatures {
  brands_limit: number;
  campaigns_limit: number;
  exports_limit: number;
  team_limit: number;
}

export interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  is_active: boolean;
  features: PlanFeatures;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan_id: string;
  subscription_status: 'active' | 'inactive' | 'trialing' | 'banned';
  created_at: string;
}

export interface BrandKit {
  id: string;
  user_id: string;
  name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  additional_colors?: string[];
  font_family: string;
  tone_of_voice: string;
  industry: string;
  language: 'en' | 'ar' | 'both';
  created_at: string;
}

export interface StrategicPlan {
  id: string;
  user_id: string;
  brand_id: string;
  title: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitors: {
    name: string;
    advantage: string;
    vulnerability: string;
  }[];
  audience_personas: {
    name: string;
    pain_points: string[];
    ideal_solution: string;
  }[];
  roadmap: {
    month: string;
    focus: string;
    tasks: string[];
  }[];
  created_at: string;
}

export interface CampaignPost {
  id: string;
  post_number: number;
  title: string;
  caption_ar: string;
  caption_en: string;
  hashtags_ar: string;
  hashtags_en: string;
  cta: string;
  design_notes: string;
  image_url?: string;
}

export interface CampaignStory {
  id: string;
  story_number: number;
  content: string;
  interactive_element: string;
}

export interface CampaignReel {
  id: string;
  reel_number: number;
  hook: string;
  script: string;
  cta: string;
}

export interface CampaignVisualPrefs {
  artStyle: 'Realism' | 'Illustrator' | 'Vector' | 'Cartoon';
  includeCharacter: boolean;
  customText?: string;
  visualEffect: string;
  addedShapes: 'None' | 'Arrows' | 'Geometric' | 'Abstract';
  includeLogo: boolean;
  addFooterShape: boolean;
}

export interface Campaign {
  id: string;
  user_id: string;
  brand_id: string;
  title: string;
  objective: string;
  audience: string;
  target_market?: string;
  content_dialect?: string;
  language: 'en' | 'ar' | 'both';
  status: 'draft' | 'generated' | 'published';
  visual_prefs?: CampaignVisualPrefs;
  posts?: CampaignPost[];
  stories?: CampaignStory[];
  reels?: CampaignReel[];
  created_at: string;
}

export interface LanguageContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
}

// Added ActivityLog interface to resolve import errors
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  timestamp: string;
}

// Added SystemSettings interface to resolve import errors
export interface SystemSettings {
  maintenance_mode: boolean;
  allow_registrations: boolean;
  alert_msg: string;
}
