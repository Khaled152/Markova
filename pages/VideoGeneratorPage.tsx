
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, useLanguage } from '../App';
import { GoogleGenAI, VideoGenerationReferenceType } from "@google/genai";
import { Video, Sparkles, Loader2, Download, AlertCircle, Key, Monitor, Smartphone, RefreshCw, X, Plus, Check } from 'lucide-react';

const VideoGeneratorPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [images, setImages] = useState<string[]>([]); // Base64 strings
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Billing check for Veo 3.1
  const [hasKey, setHasKey] = useState(false);

  const checkKey = useCallback(async () => {
    // Check for standard environment variable first (Vercel)
    if (process.env.API_KEY && process.env.API_KEY.length > 10) {
      setHasKey(true);
      return;
    }

    const aiStudio = (window as any).aistudio;
    if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
      const active = await aiStudio.hasSelectedApiKey();
      setHasKey(active);
    } else {
      setHasKey(false);
    }
  }, []);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  const handleSelectKey = async () => {
    await checkKey();
    if (hasKey) return;

    const aiStudio = (window as any).aistudio;
    if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
      await aiStudio.openSelectKey();
      setHasKey(true); 
    } else {
      alert("AI Architecture Restricted: No API key found in your environment. Please ensure API_KEY is set in your Vercel project settings.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        if (images.length >= 3) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateVideo = async () => {
    if (!prompt && images.length === 0) return;
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatus('Initializing Veo 3.1 Node...');

    try {
      const apiKey = process.env.API_KEY || '';
      if (!apiKey) throw new Error("Missing credentials. Please check project environment variables.");

      const ai = new GoogleGenAI({ apiKey });
      
      let model = 'veo-3.1-fast-generate-preview';
      let config: any = {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: aspectRatio
      };

      const payload: any = {
        model,
        prompt: prompt || 'Generate a cinematic video based on the provided frames.',
        config
      };

      if (images.length === 1) {
        const [mime, data] = images[0].split(',');
        payload.image = {
          imageBytes: data,
          mimeType: mime.match(/:(.*?);/)?.[1] || 'image/png'
        };
      } else if (images.length === 2) {
        const [mime1, data1] = images[0].split(',');
        const [mime2, data2] = images[1].split(',');
        payload.image = {
          imageBytes: data1,
          mimeType: mime1.match(/:(.*?);/)?.[1] || 'image/png'
        };
        config.lastFrame = {
          imageBytes: data2,
          mimeType: mime2.match(/:(.*?);/)?.[1] || 'image/png'
        };
      } else if (images.length === 3) {
        model = 'veo-3.1-generate-preview';
        payload.model = model;
        config.resolution = '720p';
        config.aspectRatio = '16:9';
        setResolution('720p');
        setAspectRatio('16:9');

        config.referenceImages = images.map(img => {
          const [mime, data] = img.split(',');
          return {
            image: {
              imageBytes: data,
              mimeType: mime.match(/:(.*?);/)?.[1] || 'image/png'
            },
            referenceType: VideoGenerationReferenceType.ASSET
          };
        });
      }

      setStatus('Queuing multimodal request...');
      let operation = await ai.models.generateVideos(payload);

      const loadingMessages = [
        'Analyzing reference frames...',
        'Interpolating motion vectors...',
        'Simulating cinematic lighting...',
        'Synthesizing temporal consistency...',
        'Rendering high-fidelity textures...'
      ];

      let msgIndex = 0;
      while (!operation.done) {
        setStatus(loadingMessages[msgIndex % loadingMessages.length]);
        msgIndex++;
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        try {
          operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch (e: any) {
          if (e.message?.includes("Requested entity was not found")) {
            setHasKey(false);
            throw new Error("Authentication failure. The API key might be invalid or restricted.");
          }
          throw e;
        }
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation completed but no link was provided.");

      setStatus('Streaming temporal frames...');
      const response = await fetch(`${downloadLink}&key=${apiKey}`);
      const videoBlob = await response.blob();
      const url = URL.createObjectURL(videoBlob as any);
      setVideoUrl(url);
    } catch (err: any) {
      console.error("Veo 3.1 Generation Error:", err);
      setError(err.message || "Failed to generate video. Please ensure your project environment is correctly configured.");
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Video className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Reel Architect</h2>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Nano Banana Veo 3.1 Cinematic Workspace</p>
        </div>
        
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border ${hasKey ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
           <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
           <span className="text-[10px] font-black uppercase tracking-widest">{hasKey ? 'Gateway Authenticated' : 'Gateway Disconnected'}</span>
           {!hasKey && (
             <button onClick={handleSelectKey} className="ml-3 p-1.5 bg-markova text-white rounded-lg hover:bg-blue-700">
                <RefreshCw className="w-3.5 h-3.5" />
             </button>
           )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Controls */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
          
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference Assets (Up to 3)</label>
                <span className="text-[10px] font-bold text-indigo-500 uppercase">{images.length}/3 Frames</span>
             </div>
             <div className="grid grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl border border-slate-100 relative group overflow-hidden bg-slate-50">
                     <img src={img} className="w-full h-full object-cover" alt={`ref-${idx}`} />
                     <button 
                       onClick={() => removeImage(idx)}
                       className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                     >
                        <X className="w-3.5 h-3.5" />
                     </button>
                     <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[8px] font-black text-white uppercase tracking-widest">
                        {idx === 0 ? 'Start' : idx === 1 ? 'End' : 'Asset'}
                     </div>
                  </div>
                ))}
                {images.length < 3 && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                  >
                     <Plus className="w-6 h-6" />
                     <span className="text-[8px] font-black uppercase tracking-widest">Add Frame</span>
                  </button>
                )}
             </div>
             <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Action & Motion Prompt</label>
             <textarea 
                className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[32px] outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 transition-all min-h-[140px] resize-none"
                placeholder="Describe the action taking place..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
             />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                      disabled={images.length === 3}
                      onClick={() => setAspectRatio('9:16')}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${aspectRatio === '9:16' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'} disabled:opacity-50`}
                   >
                      <Smartphone className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Reel 9:16</span>
                   </button>
                   <button 
                      onClick={() => setAspectRatio('16:9')}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${aspectRatio === '16:9' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                   >
                      <Monitor className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Widescreen</span>
                   </button>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Output Fidelity</label>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                      onClick={() => setResolution('720p')}
                      className={`p-4 rounded-2xl border transition-all font-black text-[10px] tracking-widest uppercase ${resolution === '720p' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                   >
                      720p
                   </button>
                   <button 
                      disabled={images.length === 3}
                      onClick={() => setResolution('1080p')}
                      className={`p-4 rounded-2xl border transition-all font-black text-[10px] tracking-widest uppercase ${resolution === '1080p' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'} disabled:opacity-50`}
                   >
                      1080p
                   </button>
                </div>
             </div>
          </div>

          <button 
             disabled={isLoading || (!prompt && images.length === 0) || !hasKey}
             onClick={generateVideo}
             className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black text-xl uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:bg-slate-200"
          >
             {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
             Render Cinematic Asset
          </button>
        </div>

        {/* Output Area */}
        <div className="space-y-6 sticky top-24">
           {error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-700">
                 <AlertCircle className="w-6 h-6 shrink-0" />
                 <div>
                    <p className="font-black text-xs uppercase tracking-widest">Engine Error</p>
                    <p className="text-sm font-medium opacity-80">{error}</p>
                 </div>
              </div>
           )}

           <div className={`bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl border border-slate-800 relative group flex items-center justify-center ${aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[700px] mx-auto' : 'aspect-video'}`}>
              {videoUrl ? (
                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-6 text-slate-700">
                   <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center">
                      <Video className="w-10 h-10 opacity-20" />
                   </div>
                   <p className="font-black text-[10px] uppercase tracking-[0.4em] opacity-30 text-center px-10">Video architecture will materialize here</p>
                </div>
              )}

              {isLoading && (
                 <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center text-indigo-400 p-10 text-center space-y-8">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <h3 className="font-black text-xl text-white uppercase tracking-tight">{status}</h3>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGeneratorPage;
