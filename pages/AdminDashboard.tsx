
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../App';
import { mockDb } from '../services/mockDb';
import { User, Plan, UserRole, ActivityLog } from '../types';
import { 
  ShieldCheck, Users, CreditCard, Activity, Edit3, Lock, Unlock, 
  MoreVertical, Loader2, Trash2, Plus, X, Check, AlertCircle, Search, 
  Ban, Settings, Bell, Database, Globe, Filter, Power, Info, Key, ExternalLink, RefreshCw
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'stats' | 'system'>('stats');
  
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // API Key Status state
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState(false);

  // Modals state
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Global Settings state (mock)
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    allow_registrations: true,
    alert_msg: 'Markova 3.1 infrastructure upgrade in progress.'
  });

  const checkApiKeyStatus = async () => {
    setCheckingKey(true);
    try {
      // @ts-ignore - window.aistudio is provided by the platform
      const active = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(active);
    } catch (e) {
      console.error("API Key Check Failed", e);
    } finally {
      setCheckingKey(false);
    }
  };

  const handleUpdateApiKey = async () => {
    try {
      // @ts-ignore - window.aistudio is provided by the platform
      await window.aistudio.openSelectKey();
      // Assume success and refresh status
      checkApiKeyStatus();
    } catch (e) {
      console.error("Failed to open key selector", e);
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
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const name = u.name || '';
      const email = u.email || '';
      const query = searchQuery || '';
      
      const matchesSearch = name.toLowerCase().includes(query.toLowerCase()) || 
                            email.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || u.subscription_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const stats = useMemo(() => [
    { label: 'System Identities', value: users.length, icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Sessions', value: users.filter(u => u.subscription_status === 'active').length, icon: <Activity />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Revenue Architectures', value: plans.length, icon: <CreditCard />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ], [users, plans]);

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData: any = Object.fromEntries(formData.entries());
    
    try {
      if (editingUser) {
        await mockDb.updateUser({ ...editingUser, ...userData });
      } else {
        await mockDb.saveUser({ 
          id: crypto.randomUUID(), 
          ...userData, 
          created_at: new Date().toISOString() 
        });
      }
      setShowUserModal(false);
      setEditingUser(null);
      fetchAllData();
    } catch (err) {
      alert("Failed to propagate user identity.");
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.subscription_status === 'banned' ? 'active' : 'banned';
    try {
      await mockDb.updateUser({ ...user, subscription_status: newStatus });
      fetchAllData();
    } catch (err) {
      alert("Status synchronization failed.");
    }
  };

  const handleSavePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const planData: any = Object.fromEntries(formData.entries());
    
    const formattedPlan: Plan = {
      id: editingPlan?.id || planData.id || planData.name.toLowerCase().replace(/\s+/g, '-'),
      name: planData.name,
      price_monthly: parseFloat(planData.price_monthly),
      price_yearly: parseFloat(planData.price_yearly),
      is_active: true,
      features: {
        brands_limit: parseInt(planData.brands_limit),
        campaigns_limit: parseInt(planData.campaigns_limit),
        exports_limit: parseInt(planData.exports_limit),
        team_limit: parseInt(planData.team_limit),
      },
      created_at: editingPlan?.created_at || new Date().toISOString()
    };

    try {
      if (editingPlan) {
        await mockDb.updatePlan(formattedPlan);
      } else {
        await mockDb.savePlan(formattedPlan);
      }
      setShowPlanModal(false);
      setEditingPlan(null);
      fetchAllData();
    } catch (err) {
      alert("Failed to update plan registry.");
    }
  };

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
           <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Global Systems Online</span>
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

      {/* Stats & Dashboard Tab */}
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

          <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm">
             <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Global Activity Log</h4>
                <div className="p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"><MoreVertical className="w-4 h-4 text-slate-400" /></div>
             </div>
             <div className="divide-y divide-slate-50">
                {logs.map(log => (
                  <div key={log.id} className="p-6 flex items-start gap-6 hover:bg-slate-50/50 transition-colors">
                     <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                        <Bell className="w-5 h-5" />
                     </div>
                     <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                           <p className="font-black text-slate-900 uppercase text-xs tracking-tight">{log.action}</p>
                           <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{log.details}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-4 focus-within:ring-markova/5 transition-all">
                 <Search className="w-5 h-5 text-slate-300" />
                 <input 
                   className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm"
                   placeholder="Search identities by name or verified email..."
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-4">
                 <select 
                   className="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none"
                   value={statusFilter}
                   onChange={e => setStatusFilter(e.target.value)}
                 >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="trialing">Trialing</option>
                    <option value="banned">Banned</option>
                 </select>
                 <button 
                  onClick={() => { setEditingUser(null); setShowUserModal(true); }}
                  className="bg-markova text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-100"
                >
                  <Plus className="w-4 h-4" /> Enroll Identity
                </button>
              </div>
           </div>

           <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50 border-b border-slate-50">
                   <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                     <th className="px-10 py-8">User Profile</th>
                     <th className="px-10 py-8">Security</th>
                     <th className="px-10 py-8">Tier</th>
                     <th className="px-10 py-8 text-right">Access Controls</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className={`group hover:bg-slate-50/50 transition-colors ${u.subscription_status === 'banned' ? 'bg-red-50/30' : ''}`}>
                         <td className="px-10 py-8">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-markova flex items-center justify-center text-white font-black text-lg shadow-sm">
                                 {(u.name || '?')[0].toUpperCase()}
                              </div>
                              <div>
                                 <div className="font-black text-slate-900 uppercase tracking-tight text-sm">{u.name || 'Unknown Identity'}</div>
                                 <div className="text-slate-400 text-[10px] font-bold tracking-wider lowercase">{u.email}</div>
                              </div>
                           </div>
                         </td>
                         <td className="px-10 py-8">
                           <div className="flex flex-col gap-1.5">
                              <span className={`w-fit px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-[0.2em] ${u.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                 {u.role}
                              </span>
                              <div className={`text-[10px] font-bold uppercase tracking-widest ${u.subscription_status === 'active' ? 'text-emerald-500' : u.subscription_status === 'banned' ? 'text-red-500' : 'text-slate-400'}`}>
                                 • {u.subscription_status}
                              </div>
                           </div>
                         </td>
                         <td className="px-10 py-8">
                           <div className="space-y-1">
                              <div className="font-black text-[10px] text-markova uppercase tracking-widest">{u.plan_id} Plan</div>
                              <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Enrolled {new Date(u.created_at).toLocaleDateString()}</div>
                           </div>
                         </td>
                         <td className="px-10 py-8">
                           <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                             <button onClick={() => { setEditingUser(u); setShowUserModal(true); }} className="p-3 bg-white border border-slate-100 hover:border-markova hover:text-markova rounded-xl transition-all shadow-sm">
                                <Edit3 className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleToggleUserStatus(u)} className={`p-3 bg-white border border-slate-100 rounded-xl transition-all shadow-sm ${u.subscription_status === 'banned' ? 'text-emerald-500 hover:border-emerald-500' : 'text-red-500 hover:border-red-500'}`}>
                                {u.subscription_status === 'banned' ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                             </button>
                             <button onClick={() => { if(confirm('Purge identity?')) mockDb.deleteUser(u.id).then(fetchAllData); }} className="p-3 bg-white border border-slate-100 hover:border-red-600 hover:text-red-600 rounded-xl transition-all shadow-sm">
                                <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Plan Architect Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-10">
           <div className="flex justify-end">
              <button 
                onClick={() => { setEditingPlan(null); setShowPlanModal(true); }}
                className="bg-markova text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-100"
              >
                <Plus className="w-4 h-4" /> Define New Architecture
              </button>
           </div>
           <div className="grid lg:grid-cols-3 gap-10">
              {plans.map(p => (
                <div key={p.id} className="bg-white rounded-[48px] border border-slate-100 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500 hover:border-markova/20">
                   <div className="p-10 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                      <div>
                         <h4 className="font-black text-slate-900 uppercase tracking-widest text-lg">{p.name}</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">{p.id}</p>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => { setEditingPlan(p); setShowPlanModal(true); }} className="p-3 bg-white border border-slate-100 hover:text-markova rounded-2xl transition-all shadow-sm">
                            <Edit3 className="w-4 h-4" />
                         </button>
                         <button onClick={() => { if(confirm('Delete tier?')) mockDb.deletePlan(p.id).then(fetchAllData); }} className="p-3 bg-white border border-slate-100 hover:text-red-600 rounded-2xl transition-all shadow-sm">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                   <div className="p-12 flex-1 space-y-10">
                      <div className="flex items-end gap-1">
                         <span className="text-5xl font-black text-slate-900 tracking-tighter">${p.price_monthly}</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">USD / MO</span>
                      </div>
                      <div className="space-y-5">
                         {[
                           { label: 'Brands Cap', value: p.features.brands_limit },
                           { label: 'Campaign Logic', value: p.features.campaigns_limit },
                           { label: 'Cloud Exports', value: p.features.exports_limit },
                           { label: 'Collaborators', value: p.features.team_limit },
                         ].map((f, i) => (
                           <div key={i} className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest border-b border-slate-50 pb-4 last:border-0">
                             <span className="text-slate-400">{f.label}</span>
                             <span className="text-slate-900 font-black">{f.value === -1 ? 'UNLIMITED' : f.value}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Infrastructure Tab */}
      {activeTab === 'system' && (
        <div className="grid lg:grid-cols-2 gap-10">
           {/* Gemini API Credentials Card */}
           <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-sm space-y-10 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-4">
                    <Key className="w-6 h-6 text-markova" />
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Gemini Cloud Credentials</h4>
                 </div>
                 {checkingKey ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                 ) : (
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${hasApiKey ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                       {hasApiKey ? 'Active Connection' : 'Disconnected'}
                    </div>
                 )}
              </div>

              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-4">
                 <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Link your paid Google Cloud project to enable high-quality visual synthesis, strategic reasoning, and cinematic video generation across the entire Markova instance.
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-black text-markova uppercase tracking-widest">
                    <Info className="w-4 h-4" />
                    Enterprise-Grade Encryption Applied
                 </div>
              </div>

              <div className="space-y-4">
                 <button 
                   onClick={handleUpdateApiKey}
                   className="w-full bg-markova text-white py-6 rounded-[32px] font-black text-lg uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                 >
                    <RefreshCw className="w-5 h-5" />
                    {hasApiKey ? 'Update API Identity' : 'Link Google Cloud Key'}
                 </button>
                 <a 
                   href="https://ai.google.dev/gemini-api/docs/billing" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-markova uppercase tracking-[0.2em] transition-all"
                 >
                    Billing Documentation <ExternalLink className="w-3 h-3" />
                 </a>
              </div>
           </div>

           <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4 mb-6">
                 <Power className="w-6 h-6 text-markova" />
                 <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Controls</h4>
              </div>
              
              <div className="space-y-8">
                 <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                       <p className="font-black text-slate-900 uppercase text-xs tracking-tight">Maintenance Mode</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lock global access for updates</p>
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
                       <p className="font-black text-slate-900 uppercase text-xs tracking-tight">Open Enrollment</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Allow new user self-registrations</p>
                    </div>
                    <button 
                      onClick={() => setSettings(s => ({ ...s, allow_registrations: !s.allow_registrations }))}
                      className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${settings.allow_registrations ? 'bg-markova' : 'bg-slate-200'}`}
                    >
                       <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-all ${settings.allow_registrations ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Global Alert Message</label>
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

      {/* User Enrollment Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300 border border-slate-100">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                 <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tight">{editingUser ? 'Update Identity' : 'Enroll New Identity'}</h3>
                 <button onClick={() => setShowUserModal(false)} className="p-3 hover:bg-white rounded-2xl transition-colors shadow-sm"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSaveUser} className="p-12 space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Identity Name</label>
                    <input required name="name" defaultValue={editingUser?.name} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-markova/5 transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Verified Email</label>
                    <input required type="email" name="email" defaultValue={editingUser?.email} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-markova/5 transition-all" />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Role</label>
                       <select name="role" defaultValue={editingUser?.role || 'user'} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700">
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assigned Tier</label>
                       <select name="plan_id" defaultValue={editingUser?.plan_id || 'free'} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700">
                          {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Registry Status</label>
                    <select name="subscription_status" defaultValue={editingUser?.subscription_status || 'inactive'} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700">
                       <option value="active">Active</option>
                       <option value="inactive">Inactive</option>
                       <option value="trialing">Trialing</option>
                       <option value="banned">Banned</option>
                    </select>
                 </div>
                 <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black text-lg uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl mt-4">
                    Commit to Registry
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Plan Architect Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300 border border-slate-100">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                 <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tight">{editingPlan ? 'Refine Architecture' : 'New Tier Definition'}</h3>
                 <button onClick={() => setShowPlanModal(false)} className="p-3 hover:bg-white rounded-2xl transition-colors shadow-sm"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSavePlan} className="p-12 space-y-10">
                 <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tier Name</label>
                       <input required name="name" defaultValue={editingPlan?.name} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700" placeholder="e.g. Agency Pro" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Registry ID</label>
                       <input required name="id" defaultValue={editingPlan?.id} disabled={!!editingPlan} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700 disabled:opacity-50" placeholder="e.g. agency-pro" />
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Monthly Fee (USD)</label>
                       <input required type="number" step="0.01" name="price_monthly" defaultValue={editingPlan?.price_monthly} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Yearly Fee (USD)</label>
                       <input required type="number" step="0.01" name="price_yearly" defaultValue={editingPlan?.price_yearly} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700" />
                    </div>
                 </div>

                 <div className="p-10 bg-markova/5 border border-markova/10 rounded-[40px] space-y-8">
                    <p className="text-[10px] font-black text-markova uppercase tracking-[0.4em] text-center">Infrastructure Limits</p>
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Brands Limit</label>
                          <input required type="number" name="brands_limit" defaultValue={editingPlan?.features.brands_limit} className="w-full px-8 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Campaign Limit</label>
                          <input required type="number" name="campaigns_limit" defaultValue={editingPlan?.features.campaigns_limit} className="w-full px-8 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Asset Exports</label>
                          <input required type="number" name="exports_limit" defaultValue={editingPlan?.features.exports_limit} className="w-full px-8 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Team Nodes</label>
                          <input required type="number" name="team_limit" defaultValue={editingPlan?.features.team_limit} className="w-full px-8 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" />
                       </div>
                    </div>
                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.3em]">* Enter -1 for infinite system access</p>
                 </div>

                 <button type="submit" className="w-full bg-markova text-white py-6 rounded-[32px] font-black text-lg uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl">
                    Propagate Tier Definition
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
