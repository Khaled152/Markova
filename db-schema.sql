
-- Campaigns Studio AI Database Schema

-- Users Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan_id TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans Table
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  features JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategic Plans Table
CREATE TABLE public.strategic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.brand_kits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  swot JSONB NOT NULL,
  competitors JSONB NOT NULL,
  audience_personas JSONB NOT NULL,
  roadmap JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Kits Table
CREATE TABLE public.brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  additional_colors JSONB DEFAULT '[]',
  font_family TEXT NOT NULL,
  tone_of_voice TEXT NOT NULL,
  industry TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns Table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.brand_kits(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  audience TEXT NOT NULL,
  language TEXT NOT NULL,
  target_market TEXT,
  content_dialect TEXT,
  status TEXT DEFAULT 'draft',
  visual_prefs JSONB DEFAULT '{}', -- Added visual_prefs column
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Posts
CREATE TABLE public.campaign_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  post_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  caption_ar TEXT,
  caption_en TEXT,
  hashtags_ar TEXT,
  hashtags_en TEXT,
  cta TEXT,
  design_notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_plans ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can manage their own profile" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.users FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Plans policies
CREATE POLICY "Everyone can view active plans" ON public.plans FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage plans" ON public.plans FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Brand Kits policies
CREATE POLICY "Users can manage their own brand kits" ON public.brand_kits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all brand kits" ON public.brand_kits FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Strategic Plans policies
CREATE POLICY "Users can manage their own strategic plans" ON public.strategic_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all strategic plans" ON public.strategic_plans FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Campaigns policies
CREATE POLICY "Users can manage their own campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all campaigns" ON public.campaigns FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
