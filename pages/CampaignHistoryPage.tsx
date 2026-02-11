
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../App';
import { mockDb } from '../services/mockDb';
import { Campaign } from '../types';
import { Calendar, Trash2, Eye, ExternalLink, Filter, Loader2 } from 'lucide-react';

const CampaignHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await mockDb.getCampaigns(user.id);
      setCampaigns(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this campaign?")) {
      await mockDb.deleteCampaign(id);
      fetchCampaigns();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('history')}</h2>
          <p className="text-slate-500">Access and manage all your cloud-synced content.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading history...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Campaign</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {campaigns.map(c => (
                 <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <Link to={`/campaign/${c.id}`} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                            {c.title[0]}
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 group-hover:text-indigo-600">{c.title}</p>
                             <p className="text-xs text-slate-400">{c.objective}</p>
                          </div>
                       </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <Link to={`/campaign/${c.id}`} className="p-2 text-slate-400 hover:text-indigo-600"><Eye className="w-5 h-5" /></Link>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                       </div>
                    </td>
                 </tr>
               ))}
               {campaigns.length === 0 && (
                 <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium">
                      No campaigns found in your history.
                    </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignHistoryPage;
