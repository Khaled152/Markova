
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../App';
import { mockDb } from '../services/mockDb';
import { Campaign, BrandKit } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp, Users, Calendar, Sparkles, Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [brands, setBrands] = useState<BrandKit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        mockDb.getCampaigns(user.id),
        mockDb.getBrandKits(user.id)
      ]).then(([c, b]) => {
        setCampaigns(c);
        setBrands(b);
        setLoading(false);
      });
    }
  }, [user]);

  const stats = [
    { label: t('totalCampaigns'), value: campaigns.length, icon: <TrendingUp className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50' },
    { label: t('activeBrands'), value: brands.length, icon: <Users className="w-6 h-6 text-violet-600" />, bg: 'bg-violet-50' },
    { label: t('postsGenerated'), value: campaigns.length * 3, icon: <Sparkles className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50' },
  ];

  const chartData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 3 },
    { name: 'Thu', value: 5 },
    { name: 'Fri', value: 2 },
    { name: 'Sat', value: 3 },
    { name: 'Sun', value: 10 },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-slate-500 font-medium">Synchronizing Workspace...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('dashboard')}</h2>
          <p className="text-slate-500">Welcome back, {user?.name}</p>
        </div>
        <Link 
          to="/generator"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('generate')}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className={`p-4 ${s.bg} rounded-xl`}>{s.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-8">
             <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Growth Velocity</h3>
             <select className="bg-slate-50 border-none rounded-lg text-xs px-3 py-1 font-bold text-slate-500">
               <option>Current Week</option>
             </select>
           </div>
           
           {/* Fixed: Stable parent for ResponsiveContainer */}
           <div className="w-full h-[300px] min-h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
           <h3 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">{t('history')}</h3>
           <div className="flex-1 space-y-4">
              {campaigns.slice(0, 5).map(c => (
                <Link to={`/campaign/${c.id}`} key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs uppercase border border-indigo-100">
                      {c.title[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{c.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${c.status === 'generated' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {c.status}
                  </span>
                </Link>
              ))}
              {campaigns.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <Calendar className="w-12 h-12 text-slate-100 mb-2" />
                  <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">No Active Deployments</p>
                </div>
              )}
           </div>
           <Link to="/history" className="mt-4 py-2 text-[10px] text-center font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 border-t border-slate-50">View Registry</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
