
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../App';
import { mockDb } from '../services/mockDb';
import { Campaign } from '../types';
import { 
  ChevronLeft, FileJson, FileText, CheckCircle2, Layout, 
  Instagram, MessageCircle, PlayCircle, ImageIcon, Download
} from 'lucide-react';

const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'stories' | 'reels'>('posts');

  useEffect(() => {
    const fetchCampaign = async () => {
      if (id) {
        const found = await mockDb.getCampaignById(id);
        if (found) setCampaign(found);
        else navigate('/history');
      }
    };
    fetchCampaign();
  }, [id, navigate]);

  const handleDownload = (url: string, postTitle: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `markova-${postTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!campaign) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Link to="/history" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
             <ChevronLeft className="w-5 h-5" />
           </Link>
           <div>
              <h2 className="text-2xl font-bold text-slate-900">{campaign.title}</h2>
              <p className="text-slate-500">Full Campaign Strategy & Assets</p>
           </div>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
             <FileJson className="w-5 h-5" /> Export JSON
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
             <FileText className="w-5 h-5" /> Export PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-2">
            {[
              { id: 'posts', label: t('posts'), icon: <Instagram className="w-5 h-5" />, count: campaign.posts?.length || 0 },
              { id: 'stories', label: t('stories'), icon: <MessageCircle className="w-5 h-5" />, count: campaign.stories?.length || 0 },
              { id: 'reels', label: t('reels'), icon: <PlayCircle className="w-5 h-5" />, count: campaign.reels?.length || 0 },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {tab.icon}
                <span className="flex-1">{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>{tab.count}</span>
              </button>
            ))}

            <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-100 space-y-4">
               <h4 className="text-sm font-bold text-slate-900">Campaign Brief</h4>
               <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Objective</p>
                  <p className="text-sm text-slate-600">{campaign.objective}</p>
               </div>
               <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Target Audience</p>
                  <p className="text-sm text-slate-600 line-clamp-3">{campaign.audience}</p>
               </div>
            </div>
         </div>

         <div className="lg:col-span-3 space-y-6">
            {activeTab === 'posts' && campaign.posts?.map(post => (
              <div key={post.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 group relative overflow-hidden">
                 <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                    <h4 className="font-bold text-slate-900">Day {post.post_number}: {post.title}</h4>
                    <div className="flex items-center gap-3">
                       {post.image_url && (
                          <button 
                            onClick={() => handleDownload(post.image_url!, post.title)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                          >
                             <Download className="w-4 h-4" /> HQ
                          </button>
                       )}
                       <Link to={`/post/${campaign.id}/${post.id}`} className="flex items-center gap-2 text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <ChevronLeft className="w-4 h-4 rotate-180" />
                       </Link>
                    </div>
                 </div>
                 
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">English Caption</p>
                          <p className="text-slate-700 text-sm leading-relaxed">{post.caption_en}</p>
                       </div>
                       <p className="text-indigo-600 text-sm">{post.hashtags_en}</p>
                    </div>
                    <div className="space-y-4" dir="rtl">
                       <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 font-sans">الوصف العربي</p>
                          <p className="text-slate-700 text-sm leading-relaxed font-arabic">{post.caption_ar}</p>
                       </div>
                       <p className="text-indigo-600 text-sm font-arabic">{post.hashtags_ar}</p>
                    </div>
                 </div>

                 {post.image_url ? (
                   <div className="rounded-xl overflow-hidden border border-slate-100 aspect-video md:aspect-auto md:h-64 relative group/image">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => handleDownload(post.image_url!, post.title)}
                        className="absolute bottom-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl text-slate-900 opacity-0 group-hover/image:opacity-100 transition-all hover:scale-110"
                      >
                         <Download className="w-5 h-5" />
                      </button>
                   </div>
                 ) : (
                   <div className="bg-slate-50 rounded-xl p-4 flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <Layout className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Design Suggestion</p>
                        <p className="text-sm text-slate-600 italic">"{post.design_notes}"</p>
                        <div className="mt-3 flex items-center justify-between">
                           <span className="text-xs font-bold text-slate-900">CTA: {post.cta}</span>
                           <Link to={`/post/${campaign.id}/${post.id}`} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                              <ImageIcon className="w-3 h-3" /> Generate Visual
                           </Link>
                        </div>
                      </div>
                   </div>
                 )}
              </div>
            ))}

            {activeTab === 'stories' && campaign.stories?.map(story => (
              <div key={story.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex gap-6">
                 <div className="w-16 h-24 rounded-lg bg-indigo-50 shrink-0 flex flex-col items-center justify-center font-bold text-indigo-300">
                   <span className="text-[10px] uppercase">Story</span>
                   <span className="text-2xl">#{story.story_number}</span>
                 </div>
                 <div className="flex-1 space-y-4">
                    <p className="text-slate-700 leading-relaxed font-medium">{story.content}</p>
                    <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full text-xs font-bold">
                       Interactive Feature: {story.interactive_element}
                    </div>
                 </div>
              </div>
            ))}

            {activeTab === 'reels' && campaign.reels?.map(reel => (
              <div key={reel.id} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h4 className="font-bold text-lg">Reel Script #{reel.reel_number}</h4>
                    <div className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-widest uppercase">VIRAL SCRIPT</div>
                 </div>
                 <div className="space-y-6">
                    <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-xl">
                       <span className="text-[10px] uppercase font-bold text-orange-600 block mb-1">The Hook (First 3s)</span>
                       <p className="text-lg font-black text-slate-900">"{reel.hook}"</p>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[10px] uppercase font-bold text-slate-400 block">The Script</span>
                       <p className="text-slate-700 leading-relaxed whitespace-pre-wrap italic">{reel.script}</p>
                    </div>
                    <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 rounded-xl">
                       <span className="text-xs font-bold text-slate-500 uppercase">Call to Action:</span>
                       <span className="font-bold text-indigo-600">{reel.cta}</span>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default CampaignDetailsPage;
