
import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useLanguage } from '../App';
import { mockDb } from '../services/mockDb';
import { generateCampaignContent, generatePostImage } from '../services/geminiService';
import { Campaign, BrandKit, CampaignPost, CampaignVisualPrefs } from '../types';
import { 
  Sparkles, Loader2, Upload, X, Package, 
  Check, AlertCircle, Download,
  Layers, User as UserIcon, Palette, Type as TypeIcon, MousePointer2, Info
} from 'lucide-react';

const CampaignGeneratorPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [brands, setBrands] = useState<BrandKit[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState<'idle' | 'analyzing' | 'planning' | 'designing'>('idle');
  const [currentDesignIndex, setCurrentDesignIndex] = useState(0);
  const [result, setResult] = useState<Campaign | null>(null);
  
  const [productImages, setProductImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    audience: '',
    brand_id: '',
    language: 'both' as const,
    targetMarket: 'Egypt',
    contentDialect: 'Egyptian Arabic (General)'
  });

  const [visualPrefs, setVisualPrefs] = useState<CampaignVisualPrefs>({
    artStyle: 'Realism',
    includeCharacter: false,
    customText: '',
    visualEffect: 'Cinematic Studio Lighting',
    addedShapes: 'None',
    includeLogo: true,
    addFooterShape: false
  });

  useEffect(() => {
    if (user?.id) mockDb.getBrandKits(user.id).then(setBrands);
  }, [user]);

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProductImages(prev => [...prev, reader.result as string].slice(0, 3));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDownload = (url: string, postTitle: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `markova-${postTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.brand_id) return;

    setIsLoading(true);
    setGenerationStep('analyzing');
    try {
      const brand = brands.find(b => b.id === formData.brand_id);
      if (!brand) throw new Error("Brand not found");
      
      setGenerationStep('planning');
      const content = await generateCampaignContent(
        formData.title,
        formData.objective,
        formData.audience,
        brand,
        formData.targetMarket,
        formData.contentDialect,
        visualPrefs,
        productImages
      );

      setGenerationStep('designing');
      const postsWithImages: CampaignPost[] = [];
      const totalPosts = content.posts.length;

      for (let i = 0; i < totalPosts; i++) {
        setCurrentDesignIndex(i + 1);
        const post = content.posts[i];
        
        try {
          const imageUrl = await generatePostImage(post.design_notes, "1:1", brand, productImages);
          postsWithImages.push({ ...post, id: crypto.randomUUID(), image_url: imageUrl });
        } catch (err) {
          console.error(`Failed to generate visual for post ${i+1}:`, err);
          postsWithImages.push({ ...post, id: crypto.randomUUID() });
        }
        if (i < totalPosts - 1) await new Promise(resolve => setTimeout(resolve, 800));
      }

      const newCampaign: Campaign = {
        id: crypto.randomUUID(),
        user_id: user.id,
        brand_id: formData.brand_id,
        title: formData.title,
        objective: formData.objective,
        audience: formData.audience,
        target_market: formData.targetMarket,
        content_dialect: formData.contentDialect,
        language: formData.language,
        status: 'generated',
        visual_prefs: visualPrefs,
        posts: postsWithImages,
        created_at: new Date().toISOString(),
      };

      await mockDb.saveCampaign(newCampaign);
      setResult(newCampaign);
    } catch (error: any) {
      console.error("Campaign Generation Error:", error);
      alert("Error: " + (error.message || "Please check your connection."));
    } finally {
      setIsLoading(false);
      setGenerationStep('idle');
    }
  };

  if (result) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1">
                <Check className="w-3 h-3" /> Registry Updated
              </span>
              <h2 className="text-2xl font-bold text-slate-900">{result.title}</h2>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{result.target_market} • {result.content_dialect}</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setResult(null)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">
                New Campaign
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {result.posts?.map(post => (
             <div key={post.id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm flex flex-col group hover:shadow-2xl transition-all duration-500 relative">
                <div className="aspect-square bg-slate-50 relative overflow-hidden">
                   {post.image_url ? (
                     <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4 p-8 text-center">
                        <AlertCircle className="w-8 h-8 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Visual Refinement Pending</p>
                     </div>
                   )}
                   
                   {post.image_url && (
                     <button 
                       onClick={() => handleDownload(post.image_url!, post.title)}
                       className="absolute top-5 right-5 p-3 bg-white/60 backdrop-blur-md rounded-2xl text-slate-900 opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-95 z-10"
                     >
                        <Download className="w-5 h-5" />
                     </button>
                   )}

                   <div className="absolute top-5 left-5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-slate-900 shadow-sm">
                      POST {post.post_number}
                   </div>
                </div>
                <div className="p-8 space-y-4 flex-1 flex flex-col">
                   <h4 className="font-bold text-slate-900 leading-tight text-lg">{post.title}</h4>
                   <p className="text-sm text-slate-800 font-arabic text-right dir-rtl leading-relaxed font-medium flex-1">{post.caption_ar}</p>
                   <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{post.cta}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-12 text-center">
             <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin mb-8"></div>
             <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                {generationStep === 'analyzing' ? 'Decoding Product DNA...' : 
                 generationStep === 'planning' ? 'Crafting Strategic Script...' : 
                 `Synthesizing Visual ${currentDesignIndex}/3...`}
             </h3>
             <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] animate-pulse">Nano Banana Creative Engine Active</p>
          </div>
        )}

        <form onSubmit={handleGenerate} className="p-10 md:p-16 space-y-16">
           <div className="space-y-8">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-indigo-500" />
                 Step 1. Strategy & Narrative
              </label>
              
              <div className="grid md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Identity</label>
                    <select required className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700 appearance-none" value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: e.target.value})}>
                      <option value="">Select Target Brand...</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Headline</label>
                    <input required className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700" placeholder="e.g. Genesis Winter Collection" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience Profile</label>
                 <textarea required className="w-full px-7 py-7 bg-slate-50 border border-slate-100 rounded-[32px] outline-none font-bold text-slate-700 min-h-[120px] resize-none" placeholder="Who are we selling to? Be specific..." value={formData.audience} onChange={e => setFormData({...formData, audience: e.target.value})} />
              </div>
           </div>

           <div className="space-y-8 bg-slate-50/50 p-10 rounded-[48px] border border-slate-100">
              <label className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                 <Layers className="w-5 h-5 text-indigo-500" />
                 Step 2. Visual Creative Suite
              </label>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Palette className="w-4 h-4" /> Art Medium
                    </label>
                    <select className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 outline-none" value={visualPrefs.artStyle} onChange={e => setVisualPrefs({...visualPrefs, artStyle: e.target.value as any})}>
                       <option value="Realism">Photorealistic (High-End)</option>
                       <option value="Illustrator">Digital Illustration</option>
                       <option value="Vector">Flat Vector Art</option>
                       <option value="Cartoon">3D Cartoon Style</option>
                    </select>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <UserIcon className="w-4 h-4" /> Subjects
                    </label>
                    <select className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 outline-none" value={visualPrefs.includeCharacter ? 'yes' : 'no'} onChange={e => setVisualPrefs({...visualPrefs, includeCharacter: e.target.value === 'yes'})}>
                       <option value="no">Strictly Product Focused</option>
                       <option value="yes">Include Human Models</option>
                    </select>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Sparkles className="w-4 h-4" /> Artistic Effect
                    </label>
                    <select className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 outline-none" value={visualPrefs.visualEffect} onChange={e => setVisualPrefs({...visualPrefs, visualEffect: e.target.value})}>
                       <option value="Cinematic Studio Lighting">Studio Lighting</option>
                       <option value="Hyper-Minimalist White">Hyper-Minimal</option>
                       <option value="Futuristic Neon Glow">Cyberpunk Glow</option>
                       <option value="Vintage Film Aesthetics">Vintage Film</option>
                    </select>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <MousePointer2 className="w-4 h-4" /> Creative Overlay
                    </label>
                    <select className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 outline-none" value={visualPrefs.addedShapes} onChange={e => setVisualPrefs({...visualPrefs, addedShapes: e.target.value as any})}>
                       <option value="None">No Overlays</option>
                       <option value="Arrows">Arrows & Pointers</option>
                       <option value="Geometric">Geometric Frames</option>
                       <option value="Abstract">Abstract Accents</option>
                    </select>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <TypeIcon className="w-4 h-4" /> Visual Text (On-Post)
                    </label>
                    <div className="relative">
                      <input className={`w-full px-7 py-5 bg-white border rounded-3xl outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all ${visualPrefs.customText ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-slate-200'}`} placeholder="Leave empty for NO text..." value={visualPrefs.customText} onChange={e => setVisualPrefs({...visualPrefs, customText: e.target.value})} />
                      {visualPrefs.customText && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1">
                          <Check className="w-3 h-3" /> Will Render
                        </div>
                      )}
                    </div>
                    {visualPrefs.customText ? (
                      <p className="text-[10px] font-bold text-indigo-400 flex items-center gap-2 ml-2">
                        <Info className="w-3 h-3" /> AI will strictly render "{visualPrefs.customText}" on the visuals.
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 ml-2">
                        <Info className="w-3 h-3" /> No text will be added to generated images.
                      </p>
                    )}
                 </div>

                 <div className="flex items-center gap-10">
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${visualPrefs.includeLogo ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200 group-hover:border-indigo-400'}`}>
                          {visualPrefs.includeLogo && <Check className="w-4 h-4 text-white" />}
                       </div>
                       <input type="checkbox" className="hidden" checked={visualPrefs.includeLogo} onChange={e => setVisualPrefs({...visualPrefs, includeLogo: e.target.checked})} />
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Incorporate Logo</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                       <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${visualPrefs.addFooterShape ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200 group-hover:border-indigo-400'}`}>
                          {visualPrefs.addFooterShape && <Check className="w-4 h-4 text-white" />}
                       </div>
                       <input type="checkbox" className="hidden" checked={visualPrefs.addFooterShape} onChange={e => setVisualPrefs({...visualPrefs, addFooterShape: e.target.checked})} />
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Add Brand Footer</span>
                    </label>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                 <Package className="w-5 h-5 text-indigo-500" />
                 Step 3. Source Materials
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {productImages.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-[36px] border border-slate-100 relative group overflow-hidden shadow-sm">
                       <img src={img} className="w-full h-full object-cover" alt="product" />
                       <button type="button" onClick={() => setProductImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-red-500 opacity-0 group-hover:opacity-100">
                          <X className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
                 {productImages.length < 3 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[36px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all bg-slate-50/20">
                       <Upload className="w-8 h-8" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Upload Frame</span>
                    </button>
                 )}
              </div>
              <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProductUpload} />
           </div>

           <button disabled={isLoading || !formData.brand_id || productImages.length === 0} type="submit" className="w-full bg-indigo-600 text-white py-10 rounded-[48px] font-black text-3xl hover:bg-indigo-700 transition-all shadow-2xl flex items-center justify-center gap-6 disabled:bg-slate-200">
              <Sparkles className="w-10 h-10" />
              DEPLOY FULL CAMPAIGN
           </button>
        </form>
      </div>
    </div>
  );
};

export default CampaignGeneratorPage;
