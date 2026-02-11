
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../App';
import { mockDb } from '../services/mockDb';
import { generatePostImage } from '../services/geminiService';
import { Campaign, CampaignPost, BrandKit } from '../types';
import { 
  ChevronLeft, Sparkles, Loader2, RefreshCw, 
  Instagram, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, AlertCircle
} from 'lucide-react';

const SinglePostPage: React.FC = () => {
  const { campaignId, postId } = useParams<{ campaignId: string; postId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [post, setPost] = useState<CampaignPost | null>(null);
  const [brand, setBrand] = useState<BrandKit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  // Fix: Handling async calls in useEffect to resolve promises from mockDb correctly
  useEffect(() => {
    const fetchPostData = async () => {
      if (campaignId && postId) {
        const camp = await mockDb.getCampaignById(campaignId);
        if (camp) {
          setCampaign(camp);
          const p = camp.posts?.find(x => x.id === postId);
          if (p) setPost(p);
          
          const b = await mockDb.getBrandKitById(camp.brand_id);
          if (b) setBrand(b);
        }
      }
    };
    fetchPostData();
  }, [campaignId, postId]);

  const handleGenerateImage = async () => {
    if (!post || !campaign || !brand) return;
    setIsLoading(true);
    setError(null);
    try {
      const img = await generatePostImage(
        post.design_notes, 
        "1:1", 
        brand
      );
      
      const updatedPost = { ...post, image_url: img };
      setPost(updatedPost);
      
      const updatedPosts = campaign.posts?.map(p => p.id === postId ? updatedPost : p);
      const updatedCampaign = { ...campaign, posts: updatedPosts };
      mockDb.updateCampaign(updatedCampaign);
    } catch (err: any) {
      setError(err.message || "Image generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!post || !campaign) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
         <Link to={`/campaign/${campaign.id}`} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
           <ChevronLeft className="w-5 h-5" />
         </Link>
         <div>
            <h2 className="text-2xl font-bold text-slate-900">Post Detail: Day {post.post_number}</h2>
            <p className="text-slate-500">{campaign.title}</p>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
         {/* Preview Card (Social Media Style) */}
         <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              Mockup Preview
              <button 
                onClick={() => setShowOverlay(!showOverlay)}
                className="text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
              >
                {showOverlay ? 'Hide Logo Overlay' : 'Show Logo Overlay'}
              </button>
            </h3>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden max-w-md mx-auto relative">
               <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600 text-xs overflow-hidden border border-slate-200">
                        {brand?.logo_url ? (
                          <img src={brand.logo_url} className="w-full h-full object-cover" alt="logo" />
                        ) : (
                          brand?.name?.[0] || 'A'
                        )}
                     </div>
                     <span className="font-bold text-sm">{brand?.name || 'Your Brand'}</span>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-slate-400" />
               </div>

               {/* Post Image Container */}
               <div className="aspect-square bg-slate-50 relative group overflow-hidden">
                  {post.image_url ? (
                    <>
                      <img src={post.image_url} alt="Post visual" className="w-full h-full object-cover" />
                      
                      {/* Perfect Logo Overlay - Production Quality Trick */}
                      {showOverlay && brand?.logo_url && (
                        <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl p-2 border border-white/30 shadow-lg animate-in zoom-in duration-500">
                           <img src={brand.logo_url} className="w-full h-full object-contain filter drop-shadow-md" alt="overlay logo" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-300 p-8 text-center">
                       <Instagram className="w-20 h-20 opacity-10" />
                       {error ? (
                          <div className="space-y-2 px-4">
                             <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                             <p className="text-xs text-red-500 font-bold">{error}</p>
                          </div>
                       ) : (
                          <p className="text-sm font-medium">No visual generated for this post yet</p>
                       )}
                       <button 
                         onClick={handleGenerateImage}
                         disabled={isLoading}
                         className="px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          {error ? 'Try Again' : 'Generate Image'}
                       </button>
                    </div>
                  )}

                  {post.image_url && !isLoading && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button onClick={handleGenerateImage} className="p-3 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform shadow-xl">
                          <RefreshCw className="w-5 h-5" />
                       </button>
                    </div>
                  )}

                  {isLoading && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center">
                       <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                          <p className="text-xs font-bold text-indigo-600 animate-pulse">Designing with Gemini...</p>
                       </div>
                    </div>
                  )}
               </div>

               {/* Engagement Bar */}
               <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <Heart className="w-6 h-6 hover:text-red-500 cursor-pointer transition-colors" />
                        <MessageCircle className="w-6 h-6 hover:text-indigo-600 cursor-pointer transition-colors" />
                        <Send className="w-6 h-6 hover:text-indigo-600 cursor-pointer transition-colors" />
                     </div>
                     <Bookmark className="w-6 h-6 hover:text-indigo-600 cursor-pointer transition-colors" />
                  </div>
                  <div className="text-sm">
                     <span className="font-bold">{brand?.name || 'Your Brand'}</span>{' '}
                     <span className="text-slate-700 leading-relaxed">
                        {language === 'ar' ? post.caption_ar : post.caption_en}
                     </span>
                     <p className="text-indigo-600 font-medium mt-1">
                        {language === 'ar' ? post.hashtags_ar : post.hashtags_en}
                     </p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Today • Gemini Studio AI</p>
               </div>
            </div>
         </div>

         {/* Full Copy & Details */}
         <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
               <h3 className="font-bold text-slate-900 text-xl border-b border-slate-50 pb-4">Content Breakdown</h3>
               
               <div className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] uppercase font-bold text-slate-400">Post Title</label>
                     <p className="font-bold text-slate-800">{post.title}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[10px] uppercase font-bold text-slate-400">English Caption</label>
                           <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">{post.caption_en}</p>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] uppercase font-bold text-slate-400">English Hashtags</label>
                           <p className="text-xs text-indigo-600 font-medium">{post.hashtags_en}</p>
                        </div>
                     </div>
                     <div className="space-y-4" dir="rtl">
                        <div className="space-y-1">
                           <label className="text-[10px] uppercase font-bold text-slate-400 font-sans">الوصف العربي</label>
                           <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl font-arabic">{post.caption_ar}</p>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] uppercase font-bold text-slate-400 font-sans">الهاشتاقات</label>
                           <p className="text-xs text-indigo-600 font-medium font-arabic">{post.hashtags_ar}</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Call to Action (CTA)</label>
                        <p className="font-bold text-indigo-600">{post.cta}</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: brand?.primary_color }}></div>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: brand?.secondary_color }}></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Colors Synced</span>
                     </div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100/50">
                     <label className="text-[10px] uppercase font-bold text-indigo-400 mb-1 block">AI Design Direction</label>
                     <p className="text-sm text-indigo-700 italic">"{post.design_notes}"</p>
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
               <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors">
                  Approve Post
               </button>
               <button onClick={handleGenerateImage} disabled={isLoading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:bg-slate-300 shadow-lg shadow-indigo-100">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Regenerate Visual
               </button>
            </div>
            {error && (
               <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default SinglePostPage;
