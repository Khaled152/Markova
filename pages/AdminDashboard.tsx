
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../App';
import { mockDb } from '../services/mockDb';
import { User, Plan, ActivityLog } from '../types';
import { 
  ShieldCheck, Users, CreditCard, Activity, 
  Loader2, Check, AlertCircle, Database, Settings, Key, RefreshCw, Cpu, Server, Terminal, Info
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'stats' | 'system'>('stats');
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Connection State
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkApiKeyStatus = useCallback(async () => {
    setCheckingKey(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHasApiKey(data.status === 'online');
      setError(data.status !== 'online' ? "Server API_KEY missing in Vercel Dashboard." : null);
    } catch (e) {
      setHasApiKey(false);
      setError("Server unreachable. Check your deployment status.");
    } finally {
      setCheckingKey(false);
    }
  }, []);

  useEffect(() => {
    mockDb.getUsers().then(u => {
      setUsers(u || []);
      setLoading(false);
    });
    checkApiKeyStatus();
  }, [checkApiKeyStatus]);

  const stats = useMemo(() => [
    { label: 'System Identities', value: users.length, icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Sessions', value: users.filter(u => u.subscription_status === 'active').length, icon: <Activity />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Cloud Infrastructure', value: hasApiKey ? 'Active' : 'Offline', icon: <Cpu />, color: hasApiKey ? 'text-indigo-600' : 'text-rose-600', bg: hasApiKey ? 'bg-indigo-50' : 'bg-rose-50' },
  ], [users, hasApiKey]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Core Infrastructure...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#0026FF] rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Admin Control Center</h2>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Cloud Environment & Node Management</p>
        </div>
        <div className="flex items-center gap-3">
           <div className={`px-4 py-2 border rounded-xl flex items-center gap-2 ${hasApiKey ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${hasApiKey ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${hasApiKey ? 'text-emerald-700' : 'text-rose-700'}`}>
                {hasApiKey ? 'Server Node: Synced' : 'Server Node: Disconnected'}
              </span>
           </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-100 sticky top-16 bg-slate-50/80 backdrop-blur-md z-20 pt-2 px-1">
        {[
          { id: 'stats', label: 'Overview', icon: <Database className="w-4 h-4" /> },
          { id: 'system', label: 'Infrastructure', icon: <Settings className="w-4 h-4" /> },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === tab.id ? 'border-[#0026FF] text-[#0026FF]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="p-10 bg-white rounded-[40px] shadow-sm border border-slate-50 flex flex-col group hover:shadow-2xl transition-all duration-500">
              <div className={`${s.color} ${s.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm`}>{s.icon}</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">{s.label}</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{s.value}</h3>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'system' && (
        <div className="grid lg:grid-cols-2 gap-10">
           <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-sm space-y-10 flex flex-col">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                       <Key className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Backend AI Gateway</h4>
                 </div>
                 {checkingKey ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${hasApiKey ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{hasApiKey ? 'Synced' : 'Error'}</div>}
              </div>

              <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 space-y-4 font-mono">
                <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-indigo-400" /><span className="text-[10px] text-slate-400 font-bold uppercase">Production Node Log</span></div>
                <div className="space-y-2">
                   <p className="text-xs text-slate-300"><span className="text-indigo-400">RUNTIME:</span> Vercel Edge Serverless</p>
                   <p className="text-xs text-slate-300"><span className="text-indigo-400">MODELS:</span> Gemini 3.0 Pro, Veo 3.1, Flash 2.5 Image</p>
                   <p className="text-xs text-slate-300"><span className="text-indigo-400">API_KEY_STORAGE:</span> Vercel Secret Store</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Infrastructure key is handled exclusively on the server. To update, go to Vercel Settings -> Environment Variables and redeploy.</p>
              </div>

              <button onClick={checkApiKeyStatus} className="w-full py-6 rounded-[32px] bg-slate-900 text-white font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                 <RefreshCw className={`w-5 h-5 ${checkingKey ? 'animate-spin' : ''}`} /> Sync Infrastructure
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
