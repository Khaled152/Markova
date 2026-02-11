
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth, useLanguage } from '../App';
import { mockDb } from '../services/mockDb';
import { generatePostImage } from '../services/geminiService';
import { BrandKit } from '../types';
import { Sparkles, Loader2, Download, RefreshCw, Layers, Palette, Check, Upload, X, Package, AlertCircle, Zap, Info } from 'lucide-react';

const ImageGeneratorPage: React.FC = () => {
  const { user } = useAuth();
  
  const [brands, setBrands] = useState<BrandKit[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    if (user?.id) {
      mockDb.getBrandKits(user.id).then(setBrands);
    }
  }, [user]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const selectedBrand = useMemo(() => 
    brands.find(b => b.id === selectedBrandId), 
    [brands, selectedBrandId]
  );

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Image too large. Please use an image smaller than 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setError(null);
    try {
      // Wrap single image in array for service compatibility
      const img = await generatePostImage(prompt, aspectRatio, selectedBrand, productImage ? [productImage] : []);
      setGeneratedImage(img);
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `studio-ai-gen-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold mb-2">
             < Zap className="w-3 h-3" /> Nano Banana Engine Active
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Image Studio</h2>
          <p className="text-slate-500">Advanced multimodal synthesis for brand-perfect visuals.</p>
       </div>

       <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Controls */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
             <form onSubmit={handleGenerate} className="space-y-6">
                
                {/* Brand Selector */}
                <div className="space-y-3">
                   <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-indigo-600" />
                      Apply Brand Identity
                   </label>
                   <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                   >
                      <option value="">No Brand (Generic Style)</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                   </select>
                </div>

                {/* Product/Reference Image Upload */}
                <div className="space-y-3">
                   <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-600" />
                      Reference Product
                   </label>
                   <div className="flex gap-4 items-start">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative group overflow-hidden ${productImage ? 'border-indigo-400' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'}`}
                      >
                         {productImage ? (
                           <>
                              <img src={productImage} alt="product" className="w-full h-full object-cover" />
                              <button 
                                onClick={(e) => { e.stopPropagation(); setProductImage(null); }}
                                className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                 <X className="w-3 h-3" />
                              </button>
                           </>
                         ) : (
                           <>
                              <Upload className="w-6 h-6 text-slate-300" />
                              <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Upload</span>
                           </>
                         )}
                      </div>
                      <div className="flex-1 space-y-1">
                         <p className="text-xs font-bold text-slate-700">Synthesize Real Item</p>
                         <p className="text-[10px] text-slate-500 leading-relaxed">Nano Banana will reconstruct this specific item into your scene with matching lighting.</p>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProductUpload} />
                   </div>
                </div>

                {/* Status Indicators */}
                {selectedBrand && (
                  <div className="flex flex-col gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: selectedBrand.primary_color }}></div>
                          <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: selectedBrand.secondary_color }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1">
                          <Check className="w-3 h-3" /> Brand Synced
                        </span>
                    </div>
                    {selectedBrand.logo_url && (
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg p-1 border border-indigo-100 flex items-center justify-center shrink-0">
                            <img src={selectedBrand.logo_url} className="w-full h-full object-contain" alt="brand logo" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-700">Logo Reference Active</p>
                            <p className="text-[10px] text-slate-500">Geometry extraction enabled.</p>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={showOverlay} 
                              onChange={(e) => setShowOverlay(e.target.checked)}
                              className="w-4 h-4 rounded text-indigo-600 border-slate-300"
                            />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Overlay Logo</span>
                          </label>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                   <label className="text-sm font-bold text-slate-700">Creative Scene Prompt</label>
                   <textarea 
                      required
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] resize-none text-slate-700 text-sm"
                      placeholder="e.g. A luxury product placed on a floating glass platform above a desert at sunset, with golden Arabic-inspired calligraphic patterns in the sky."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                   />
                   <div className="bg-amber-50 p-3 rounded-xl flex gap-3 border border-amber-100">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-700 leading-normal font-medium">
                        <strong>Arabic Tip:</strong> Our AI creates stylized calligraphic art rather than readable text to ensure perfect visual quality without broken letters.
                      </p>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-sm font-bold text-slate-700">Aspect Ratio</label>
                   <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: '1:1', label: 'Square' },
                        { id: '16:9', label: 'Landscape' },
                        { id: '9:16', label: 'Portrait' }
                      ].map(ratio => (
                        <button
                          key={ratio.id}
                          type="button"
                          onClick={() => setAspectRatio(ratio.id as any)}
                          className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 ${aspectRatio === ratio.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                        >
                           <span className="font-bold text-xs">{ratio.id}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-slate-300"
                >
                   {isLoading ? (
                     <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Nano Banana Synthesizing...
                     </>
                   ) : (
                     <>
                        <Sparkles className="w-5 h-5" />
                        Generate Masterpiece
                     </>
                   )}
                </button>
             </form>
          </div>

          {/* Result Area */}
          <div className="space-y-4 sticky top-24">
             {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm animate-in slide-in-from-top-2">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   <div>
                      <p className="font-bold">Synthesis Error</p>
                      <p className="text-xs opacity-80">{error}</p>
                   </div>
                </div>
             )}
             
             <div className={`bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm relative group flex items-center justify-center ${aspectRatio === '1:1' ? 'aspect-square' : aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-h-[700px] mx-auto'}`}>
                {generatedImage ? (
                  <>
                    <img src={generatedImage} alt="AI Generated" className="w-full h-full object-cover" />
                    {showOverlay && selectedBrand?.logo_url && (
                      <div className="absolute bottom-6 right-6 w-14 h-14 bg-white/30 backdrop-blur-md rounded-2xl p-2 border border-white/40 shadow-xl animate-in fade-in zoom-in duration-500">
                         <img src={selectedBrand.logo_url} className="w-full h-full object-contain filter drop-shadow-lg" alt="overlay logo" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-slate-300">
                     <Zap className="w-16 h-16 opacity-10" />
                     <p className="font-bold">Your visual will appear here</p>
                  </div>
                )}

                {generatedImage && !isLoading && (
                   <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                      <button onClick={handleDownload} className="p-4 bg-white rounded-2xl text-slate-900 font-bold hover:scale-110 transition-transform flex items-center gap-2 shadow-2xl">
                         <Download className="w-5 h-5" /> Download
                      </button>
                      <button onClick={() => handleGenerate()} className="p-4 bg-white rounded-2xl text-slate-900 font-bold hover:scale-110 transition-transform flex items-center gap-2 shadow-2xl">
                         <RefreshCw className="w-5 h-5" /> Re-generate
                      </button>
                   </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center text-indigo-600 gap-4">
                     <Loader2 className="w-12 h-12 animate-spin" />
                     <div className="text-center">
                        <p className="font-bold text-lg animate-pulse">Nano Banana is Reconstructing...</p>
                        <p className="text-xs text-indigo-400 font-medium px-8">Merging product textures and lighting into a single commercial asset.</p>
                     </div>
                  </div>
                )}
             </div>
             
             {generatedImage && (
                <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3 border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                   <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
                      <Check className="w-4 h-4" />
                   </div>
                   <p className="text-xs text-emerald-700 font-medium">Successfully generated with calligraphic visual optimization.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default ImageGeneratorPage;
