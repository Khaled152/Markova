
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { MarkovaLogo } from '../App';
import { ArrowRight, Github, Loader2, AlertCircle, Mail, Lock, User as UserIcon } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.fullName
            }
          }
        });
        if (error) throw error;
        alert("Success! Check your email to verify your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen -mt-24 flex items-center justify-center p-6 bg-slate-50/50">
      <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-6 flex flex-col items-center">
           <Link to="/" className="hover:scale-105 transition-transform duration-500">
              <MarkovaLogo size="lg" />
           </Link>
           <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {isSignUp ? 'Create your workspace' : 'Enter Workspace'}
              </h2>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {isSignUp ? 'Start your global expansion' : 'Authenticate to continue to Markova'}
              </p>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-blue-100/30 border border-slate-100">
           {error && (
             <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm animate-in shake duration-300">
               <AlertCircle className="w-5 h-5 shrink-0" />
               <p className="font-bold">{error}</p>
             </div>
           )}

           <form onSubmit={handleAuth} className="space-y-6">
              {isSignUp && (
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                   <div className="relative">
                     <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                       required
                       type="text"
                       className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700"
                       placeholder="Mark Zuckerberg"
                       value={formData.fullName}
                       onChange={e => setFormData({...formData, fullName: e.target.value})}
                     />
                   </div>
                </div>
              )}

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enterprise Email</label>
                 <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                     required
                     type="email"
                     className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700"
                     placeholder="name@markova.io"
                     value={formData.email}
                     onChange={e => setFormData({...formData, email: e.target.value})}
                   />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Private Key</label>
                    {!isSignUp && <button type="button" className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">Recovery</button>}
                 </div>
                 <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                     required
                     type="password"
                     className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700"
                     placeholder="••••••••"
                     value={formData.password}
                     onChange={e => setFormData({...formData, password: e.target.value})}
                   />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0026FF] text-white py-6 rounded-[24px] font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-4 disabled:bg-slate-200 disabled:shadow-none uppercase tracking-tight"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? 'Initialize Workspace' : 'Authorize Login')}
                {!isLoading && <ArrowRight className="w-6 h-6" />}
              </button>
           </form>

           <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400 bg-white px-6 tracking-[0.4em]">Secure Connect</div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-black text-[10px] text-slate-700 shadow-sm uppercase tracking-widest"
              >
                 <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                 Google
              </button>
              <button className="flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-black text-[10px] text-slate-700 shadow-sm uppercase tracking-widest">
                 <Github className="w-4 h-4" />
                 GitHub
              </button>
           </div>
        </div>

        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          {isSignUp ? 'Part of the collective?' : "Need a workspace?"}{' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 underline underline-offset-4"
          >
            {isSignUp ? 'Login Here' : 'Create Free'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;