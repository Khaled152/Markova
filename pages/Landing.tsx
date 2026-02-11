
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage, MarkovaLogo } from '../App';
import { Sparkles, BarChart3, Target, Globe, ArrowRight, Zap, ShieldCheck, Rocket } from 'lucide-react';

const Landing: React.FC = () => {
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      {/* Nav */}
      <nav className="border-b border-slate-50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <MarkovaLogo size="md" />
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">
              {t('login')}
            </Link>
            <Link to="/login" className="bg-[#0026FF] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
              Get Early Access
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-[#0026FF] text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3" />
              <span>The Next Generation Marketing OS</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              Marketing at <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0026FF] to-blue-500">Light Speed.</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-lg font-medium">
              Markova transforms your brand identity into a month of viral content and global strategy in seconds. No more agencies. No more waiting.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/login" className="group flex items-center justify-center gap-4 bg-[#0026FF] text-white px-10 py-5 rounded-[24px] text-lg font-black uppercase tracking-tight hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100">
                Launch Your Brand
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[24px]">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://picsum.photos/seed/${i+500}/100/100`} className="w-10 h-10 rounded-full border-4 border-white object-cover" alt="user" />
                  ))}
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Powering</p>
                   <p className="text-xs font-black text-slate-900 uppercase">1,200+ Agencies</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 bg-blue-500/5 blur-[100px] rounded-full"></div>
            <div className="relative bg-white p-4 rounded-[48px] shadow-2xl border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-700 group">
               <img 
                 src="https://picsum.photos/seed/markova-dash/1200/900" 
                 className="rounded-[36px] grayscale-[0.8] group-hover:grayscale-0 transition-all duration-700" 
                 alt="Markova Interface" 
               />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#0026FF] rounded-full flex items-center justify-center text-white shadow-2xl animate-pulse">
                  <Rocket className="w-10 h-10" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 border-y border-slate-50">
         <div className="max-w-7xl mx-auto px-6 overflow-hidden">
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12">Trusted by global builders</p>
            <div className="flex flex-wrap justify-center items-center gap-16 grayscale opacity-30">
               {['APPLE', 'META', 'STRIPE', 'NIKE', 'ADOBE'].map(brand => (
                 <span key={brand} className="text-2xl font-black tracking-tighter">{brand}</span>
               ))}
            </div>
         </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          {[
            { 
              icon: <Target className="w-10 h-10 text-blue-600" />, 
              title: 'Strategic Core', 
              desc: 'Deep-dive SWOT and competitor analysis that actually understands your market dynamics.' 
            },
            { 
              icon: <Globe className="w-10 h-10 text-indigo-600" />, 
              title: 'Culture-Native AI', 
              desc: 'Seamlessly transition between perfect English and localized Arabic dialects for authentic engagement.' 
            },
            { 
              icon: <BarChart3 className="w-10 h-10 text-emerald-600" />, 
              title: 'Growth Analytics', 
              desc: 'Monitor your marketing footprint and scale across multiple brands with unified management.' 
            }
          ].map((f, i) => (
            <div key={i} className="group p-10 bg-white rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col h-full">
              <div className="mb-8 p-5 bg-slate-50 rounded-3xl w-fit group-hover:bg-blue-50 transition-colors">{f.icon}</div>
              <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium flex-1">{f.desc}</p>
              <div className="mt-8 pt-8 border-t border-slate-50">
                 <button className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">Learn More <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;