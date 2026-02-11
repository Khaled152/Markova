
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../App';
import { mockDb } from '../services/mockDb';
import { User, Plan, UserRole, ActivityLog } from '../types';
import { 
  ShieldCheck, Users, CreditCard, Activity, 
  Loader2, Trash2, Plus, X, Check, AlertCircle, Search, 
  Settings, Bell, Database, Globe, Power, Info, Key, ExternalLink, RefreshCw, Cpu, Server, Terminal, Zap
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'stats' | 'system'>('stats');
  
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Connection State
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Global Settings state (mock)
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    allow_registrations: true,
    alert_msg: 'Markova 3.5 Core Engine Upgrade in progress.'
  });

  const checkApiKeyStatus = useCallback(async () => {
    setCheckingKey(true);
    try {
      // Priority 1: Check system-level environment variable (Standard for Vercel/Self-hosted)
      const envKey = process.env.API_KEY;
      if (envKey && envKey.length > 10) {
        setHasApiKey(true);
        setError(null);
        return;
      }

      // Priority 2: Check for AI Studio platform selection (Standard for preview/iframe)
      const aiStudio = (window as any).aistudio;
      if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
        const active = await aiStudio.hasSelectedApiKey();
        setHasApiKey(active);
      } else {
        setHasApiKey(false);
      }
    } catch (e) {
      console.error("API Key Check Failed", e);
      setHasApiKey(false);
    } finally {
      setCheckingKey(false);
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // Re-run the environment check first
      await checkApiKeyStatus();
      
      if (hasApiKey) {
        alert("System Synchronized: The AI Gateway is active via your server environment variables.");
        return;
      }

      // If still no key, try the selection dialog
      const aiStudio = (window as any).aistudio;
      if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
        await aiStudio.openSelectKey();
        setHasApiKey(true);
      } else {
        setError("AI Gateway could not be initialized. Please ensure the API_KEY environment variable is correctly set in your project settings and you have redeployed the application.");
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred during gateway activation.");
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [u, p, l] = await Promise.all([
        mockDb.getUsers(), 
        mockDb.getPlans(),
        mockDb.getActivityLogs()
      ]);
      setUsers(u || []);
      setPlans(p || []);
      setLogs(l || []);
      await checkApiKeyStatus();
    } catch (err) {
      console.error("Admin Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [checkApiKeyStatus]);

  const stats = useMemo(() => [
    { label: 'System Identities', value: users.length, icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Sessions', value: users.filter(u => u.subscription_status === 'active').length, icon: <Activity />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'AI Throughput', value: hasApiKey ? 'Optimal' : 'Offline', icon: <Cpu />, color: hasApiKey ? 'text-indigo-600' : 'text-rose-600', bg: hasApiKey ? 'bg-indigo-50' : 'bg-rose-50' },
  ], [users, hasApiKey]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-markova animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Core Systems...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-markova rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Admin Control Center</h2>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Proprietary Workspace Management Interface</p>
        </div>
        <div className="flex items-center gap-3">
           <div className={`px-4 py-2 border rounded-xl flex items-center gap-2 ${hasApiKey ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${hasApiKey ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${hasApiKey ? 'text-emerald-700' : 'text-rose-700'}`}>
                {hasApiKey ? 'AI Node Online' : 'AI Node Offline'}
              </span>
           </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-100 sticky top-16 bg-slate-50/80 backdrop-blur-md z-20 pt-2 px-1">
        {[
          { id: 'stats', label: 'Dashboard', icon: <Database className="w-4 h-4" /> },
          { id: 'users', label: 'Identities', icon: <Users className="w-4 h-4" /> },
          { id: 'plans', label: 'Subscription Architect', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'system', label: 'Infrastructure', icon: <Settings className="w-4 h-4" /> },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === tab.id ? 'border-markova text-markova' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Stats */}
      {activeTab === 'stats' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="p-10 bg-white rounded-[40px] shadow-sm border border-slate-50 flex flex-col group hover:shadow-2xl transition-all duration-500">
                <div className={`${s.color} ${s.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm`}>{s.icon}</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">{s.label}</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{s.value}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infrastructure & API Tab */}
      {activeTab === 'system' && (
        <div className="grid lg:grid-cols-2 gap-10">
           {/* Gemini AI Gateway Status Card */}
           <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-sm space-y-10 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                       <Key className="w-6 h-6 text-markova" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">AI Orchestration</h4>
                 </div>
                 {checkingKey ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                 ) : (
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${hasApiKey ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                       {hasApiKey ? 'System Ready' : 'Disconnected'}
                    </div>
                 )}
              </div>

              {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-[24px] flex flex-col gap-2 text-red-700 text-xs animate-in shake duration-300">
                  <div className="flex items-center gap-2 font-black uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Gateway Configuration Required
                  </div>
                  <p className="font-medium opacity-80 leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-8">
                 <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 space-y-4 font-mono">
                    <div className="flex items-center gap-2">
                       <Terminal className="w-4 h-4 text-indigo-400" />
                       <span className="text-[10px] text-slate-400 font-bold uppercase">Infrastructure Monitor</span>
                    </div>
                    <div className="space-y-2">
                       <p className="text-xs text-slate-300"><span className="text-indigo-400">ENGINE:</span> Gemini 3.0 Pro & Veo 3.1</p>
                       <p className="text-xs text-slate-300">
                          <span className="text-indigo-400">STATUS:</span> 
                          <span className={hasApiKey ? 'text-emerald-400' : 'text-rose-400'}> {hasApiKey ? 'AUTHENTICATED' : 'UNAUTHORIZED'}</span>
                       </p>
                       <p className="text-xs text-slate-300">
                          <span className="text-indigo-400">VAR_SOURCE:</span> 
                          <span> {process.env.API_KEY ? 'process.env.API_KEY' : 'Not Detected'}</span>
                       </p>
                    </div>
                 </div>

                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4">
                    <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Server Setup Guide</p>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        The AI gateway automatically prioritizes the <code className="bg-slate-200 px-1 rounded">API_KEY</code> variable in your project's settings. Once you add the key and redeploy, the status above will automatically turn green.
                      </p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <button 
                   onClick={handleConnect}
                   disabled={isConnecting}
                   className={`w-full py-6 rounded-[32px] font-black text-lg uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 ${hasApiKey ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700' : 'bg-markova text-white shadow-blue-100 hover:bg-blue-700'}`}
                 >
                    {isConnecting ? (
                       <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                       hasApiKey ? <Check className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />
                    )}
                    {hasApiKey ? 'System Online' : 'Refresh Gateway Status'}
                 </button>
                 <a 
                   href="https://ai.google.dev/gemini-api/docs/billing" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-markova uppercase tracking-[0.2em] transition-all"
                 >
                    Manage API Billing <ExternalLink className="w-3 h-3" />
                 </a>
              </div>
           </div>

           {/* System Controls */}
           <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-slate-50 rounded-xl">
                    <Server className="w-6 h-6 text-markova" />
                 </div>
                 <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Deployment</h4>
              </div>
              
              <div className="space-y-8">
                 <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                       <p className="font-black text-slate-900 uppercase text-xs tracking-tight">Maintenance Mode</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Halt user generation cycles</p>
                    </div>
                    <button 
                      onClick={() => setSettings(s => ({ ...s, maintenance_mode: !s.maintenance_mode }))}
                      className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${settings.maintenance_mode ? 'bg-red-500' : 'bg-slate-200'}`}
                    >
                       <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-all ${settings.maintenance_mode ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                 </div>

                 <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                       <p className="font-black text-slate-900 uppercase text-xs tracking-tight">Open Registration</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Allow new identity enrollment</p>
                    </div>
                    <button 
                      onClick={() => setSettings(s => ({ ...s, allow_registrations: !s.allow_registrations }))}
                      className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${settings.allow_registrations ? 'bg-markova' : 'bg-slate-200'}`}
                    >
                       <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-all ${settings.allow_registrations ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Global System Broadcast</label>
                    <div className="relative">
                       <Bell className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                       <input 
                         className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[32px] outline-none font-bold text-slate-700 focus:ring-4 focus:ring-markova/5 transition-all"
                         value={settings.alert_msg}
                         onChange={e => setSettings(s => ({ ...s, alert_msg: e.target.value }))}
                       />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'users' && <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Identity Registry Synchronized</div>}
      {activeTab === 'plans' && <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Tier Architect Loaded</div>}
    </div>
  );
};

export default AdminDashboard;
