
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, useLanguage } from '../App';
import { Video, Sparkles, Loader2, Download, AlertCircle, Monitor, Smartphone, RefreshCw, X, Plus } from 'lucide-react';

const VideoGeneratorPage: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const generateVideo = async () => {
    if (!prompt && images.length === 0) return;
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatus('Initializing Server Handshake...');

    try {
      let model = 'veo-3.1-fast-generate-preview';
      let config: any = { numberOfVideos: 1, resolution, aspectRatio };
      let payload: any = { model, prompt: prompt || 'Cinematic video.', config };

      if (images.length === 1) {
        const [mime, data] = images[0].split(',');
        payload.image = { imageBytes: data, mimeType: mime.match(/:(.*?);/)?.[1] || 'image/png' };
      } else if (images.length === 2) {
        const [mime1, data1] = images[0].split(',');
        const [mime2, data2] = images[1].split(',');
        payload.image = { imageBytes: data1, mimeType: mime1.match(/:(.*?);/)?.[1] || 'image/png' };
        payload.lastFrame = { imageBytes: data2, mimeType: mime2.match(/:(.*?);/)?.[1] || 'image/png' };
      }

      // Start Operation via Server
      const startRes = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      let operation = await startRes.json();
      if (!startRes.ok) throw new Error(operation.error || "Server failed to start video generation.");

      // Polling via Server
      while (!operation.done) {
        setStatus('Synthesizing temporal frames...');
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        const pollRes = await fetch(`/api/video?id=${operation.name}`);
        operation = await pollRes.json();
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("No output received from model.");

      // Download must be handled carefully with API KEY which is only on server
      // So we use a proxy or append key securely if the client has it (in this case server handles)
      setStatus('Finalizing assets...');
      setVideoUrl(downloadLink); // Most cloud video links are temporary signed URLs
    } catch (err: any) {
      setError(err.message || "Failed to generate video.");
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        if (images.length >= 2) return;
        const reader = new FileReader();
        reader.onloadend = () => setImages(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Video className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Reel Architect</h2>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Server-Side Secure Production Hub</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motion Prompt</label>
             <textarea 
                className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[32px] outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 transition-all min-h-[140px] resize-none"
                placeholder="Describe the action..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
             />
          </div>

          <div className="grid grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setAspectRatio('9:16')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${aspectRatio === '9:16' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                      <Smartphone className="w-5 h-5" />
                   </button>
                   <button onClick={() => setAspectRatio('16:9')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${aspectRatio === '16:9' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                      <Monitor className="w-5 h-5" />
                   </button>
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keyframes</label>
                <div className="flex gap-4">
                   {images.map((img, i) => (
                     <div key={i} className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden relative group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><X className="w-4 h-4" /></button>
                     </div>
                   ))}
                   {images.length < 2 && (
                     <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-indigo-400 hover:text-indigo-400 transition-all">
                        <Plus className="w-6 h-6" />
                     </button>
                   )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             </div>
          </div>

          <button 
             disabled={isLoading || !prompt}
             onClick={generateVideo}
             className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black text-xl uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:bg-slate-200"
          >
             {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
             Deploy to Server
          </button>
        </div>

        <div className="space-y-6">
           {error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-700">
                 <AlertCircle className="w-6 h-6 shrink-0" />
                 <p className="text-sm font-medium">{error}</p>
              </div>
           )}

           <div className={`bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl border border-slate-800 relative group flex items-center justify-center ${aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[600px] mx-auto' : 'aspect-video'}`}>
              {videoUrl ? (
                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-10">
                   <p className="font-black text-[10px] uppercase tracking-[0.4em] opacity-30 text-slate-400">Cinematic asset pending</p>
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
