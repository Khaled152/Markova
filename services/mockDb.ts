
import { supabase } from './supabase';
import { User, BrandKit, Campaign, CampaignPost, StrategicPlan, Plan, SystemSettings, ActivityLog } from '../types';

export const mockDb = {
  // Strategic Plans
  async getStrategicPlans(userId: string): Promise<StrategicPlan[]> {
    const { data, error } = await supabase
      .from('strategic_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data || [];
  },

  async saveStrategicPlan(plan: StrategicPlan) {
    const { error } = await supabase.from('strategic_plans').insert([plan]);
    if (error) throw error;
  },

  // Brand Kits
  async getBrandKits(userId: string): Promise<BrandKit[]> {
    const { data, error } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getBrandKitById(id: string): Promise<BrandKit | null> {
    const { data, error } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async saveBrandKit(brand: BrandKit) {
    const { error } = await supabase.from('brand_kits').insert([brand]);
    if (error) throw error;
  },

  async updateBrandKit(brand: BrandKit) {
    const { error } = await supabase.from('brand_kits').update(brand).eq('id', brand.id);
    if (error) throw error;
  },

  async deleteBrandKit(id: string) {
    const { error } = await supabase.from('brand_kits').delete().eq('id', id);
    if (error) throw error;
  },

  // Campaigns
  async getCampaigns(userId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    const { data: campaign, error: cErr } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (cErr) return null;

    const [posts, stories, reels] = await Promise.all([
      supabase.from('campaign_posts').select('*').eq('campaign_id', id).order('post_number'),
      supabase.from('campaign_stories').select('*').eq('campaign_id', id).order('story_number'),
      supabase.from('campaign_reels').select('*').eq('campaign_id', id).order('reel_number')
    ]);

    return {
      ...campaign,
      posts: posts.data || [],
      stories: stories.data || [],
      reels: reels.data || []
    };
  },

  async saveCampaign(campaign: Campaign) {
    const { posts, stories, reels, ...baseCampaign } = campaign;
    const { error: cErr } = await supabase.from('campaigns').insert([baseCampaign]);
    if (cErr) throw cErr;

    const inserts = [];
    if (posts) inserts.push(supabase.from('campaign_posts').insert(posts.map(p => ({ ...p, campaign_id: campaign.id }))));
    await Promise.all(inserts);
  },

  async updateCampaign(campaign: Campaign) {
    const { posts, stories, reels, ...baseCampaign } = campaign;
    const { error } = await supabase.from('campaigns').update(baseCampaign).eq('id', campaign.id);
    if (error) throw error;
  },

  async updatePost(post: CampaignPost) {
    const { error } = await supabase.from('campaign_posts').update(post).eq('id', post.id);
    if (error) throw error;
  },

  async deleteCampaign(id: string) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
  },

  // Admin: Users Management
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async saveUser(user: User) {
    const { error } = await supabase.from('users').insert([user]);
    if (error) throw error;
  },

  async updateUser(user: User) {
    const { error } = await supabase.from('users').update(user).eq('id', user.id);
    if (error) throw error;
  },

  async deleteUser(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },

  // Admin: Plans Management
  async getPlans(): Promise<Plan[]> {
    const { data, error } = await supabase.from('plans').select('*').order('price_monthly', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async savePlan(plan: Plan) {
    const { error } = await supabase.from('plans').insert([plan]);
    if (error) throw error;
  },

  async updatePlan(plan: Plan) {
    const { error } = await supabase.from('plans').update(plan).eq('id', plan.id);
    if (error) throw error;
  },

  async deletePlan(id: string) {
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) throw error;
  },

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    // In a real app we'd query an activity_logs table
    return [
      { id: '1', user_id: 'sys', action: 'Plan Created', details: 'Agency Elite plan added to registry.', timestamp: new Date().toISOString() },
      { id: '2', user_id: 'sys', action: 'User Signup', details: 'New enterprise identity enrolled.', timestamp: new Date().toISOString() },
    ];
  }
};
