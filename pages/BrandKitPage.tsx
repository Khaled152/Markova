
import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useLanguage } from '../App';
import { mockDb } from '../services/mockDb';
import { BrandKit } from '../types';
import { Plus, Trash2, Palette, Megaphone, Upload, X, Edit2, Loader2, Briefcase, Hash } from 'lucide-react';

const BrandKitPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [brands, setBrands] = useState<BrandKit[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialFormState = {
    name: '',
    industry: '',
    primary_color: '#4f46e5',
    secondary_color: '#ec4899',
    logo_url: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchBrands = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await mockDb.getBrandKits(user.id);
      setBrands(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [user]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo too large. Max 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (brand: BrandKit) => {
    setEditingBrandId(brand.id);
    setFormData({
      name: brand.name,
      industry: brand.industry,
      primary_color: brand.primary_color,
      secondary_color: brand.secondary_color,
      logo_url: brand.logo_url || '',
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this Brand Kit?")) {
      await mockDb.deleteBrandKit(id);
      fetchBrands();
    }
  };

  const handleColorChange = (key: 'primary_color' | 'secondary_color', value: string) => {
    let formattedValue = value;
    // Ensure hex starts with # if it's a valid hex length
    if (value.length > 0 && !value.startsWith('#')) {
      formattedValue = '#' + value;
    }
    setFormData(prev => ({ ...prev, [key]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const brandPayload: Partial<BrandKit> = {
      ...formData,
      tone_of_voice: 'Professional and engaging',
      font_family: 'Inter',
      language: 'both',
      additional_colors: []
    };

    try {
      if (editingBrandId) {
        const updatedBrand: BrandKit = {
          id: editingBrandId,
          user_id: user.id,
          created_at: brands.find(b => b.id === editingBrandId)?.created_at || new Date().toISOString(),
          ...(brandPayload as any)
        };
        await mockDb.updateBrandKit(updatedBrand);
      } else {
        const newBrand: BrandKit = {
          id: crypto.randomUUID(),
          user_id: user.id,
          created_at: new Date().toISOString(),
          ...(brandPayload as any)
        };
        await mockDb.saveBrandKit(newBrand);
      }
      
      setIsAdding(false);
      setEditingBrandId(null);
      setFormData(initialFormState);
      fetchBrands();
    } catch (err) {
      alert("Failed to save brand kit.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('brandKits')}</h2>
          <p className="text-slate-500">Define your brand identity for consistent AI generations.</p>
        </div>
        <button 
          onClick={() => {
            setEditingBrandId(null);
            setFormData(initialFormState);
            setIsAdding(true);
          }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          {t('createBrand')}
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium">Syncing identities...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map(b => (
            <div key={b.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="h-32 bg-slate-50 relative flex items-center justify-center border-b border-slate-100 p-6">
                {b.logo_url ? (
                  <img src={b.logo_url} alt={b.name} className="h-full w-full object-contain" />
                ) : (
                  <Megaphone className="w-12 h-12 text-indigo-100" />
                )}
                <div className="absolute top-3 left-3 flex gap-1">
                   <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: b.primary_color }} />
                   <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: b.secondary_color }} />
                </div>
              </div>
              
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-xl truncate">{b.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold uppercase tracking-wider mt-1">
                       <Briefcase className="w-3 h-3" />
                       {b.industry}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(b)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-slate-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-slate-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {brands.length === 0 && (
            <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center">
              <Megaphone className="w-16 h-16 text-slate-200 mb-4" />
              <h4 className="text-xl font-bold text-slate-900">No brand kits yet</h4>
              <p className="text-slate-500 mb-8">Start by defining your brand's unique identity.</p>
              <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                Create Brand Kit
              </button>
            </div>
          )}
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">{editingBrandId ? 'Update Brand' : 'New Brand Identity'}</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              
              {/* Logo Upload Section */}
              <div className="flex flex-col items-center gap-4">
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-24 h-24 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden bg-slate-50 group relative"
                 >
                    {formData.logo_url ? (
                      <img src={formData.logo_url} className="w-full h-full object-contain p-2" alt="logo" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-400" />
                    )}
                 </div>
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Brand Logo</p>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </div>

              <div className="space-y-6">
                {/* Brand Name */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
                  <input 
                    required 
                    placeholder="e.g. Lumin Digital"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                {/* Industry Text Input */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                  <input 
                    required 
                    type="text"
                    placeholder="e.g. Technology, Fashion, etc."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                    value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                  />
                </div>

                {/* Brand Colors (Editable by picker or code) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Primary Color</label>
                    <div className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl items-center focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                       <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                          <input 
                            type="color" 
                            className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-none p-0"
                            value={formData.primary_color}
                            onChange={e => handleColorChange('primary_color', e.target.value)}
                          />
                       </div>
                       <div className="flex-1 relative">
                          <Hash className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                          <input 
                            type="text"
                            placeholder="#FFFFFF"
                            className="w-full pl-6 pr-2 bg-transparent border-none outline-none text-sm font-mono font-bold text-slate-700 uppercase"
                            value={formData.primary_color}
                            onChange={e => handleColorChange('primary_color', e.target.value)}
                            maxLength={7}
                          />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secondary Color</label>
                    <div className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl items-center focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                       <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                          <input 
                            type="color" 
                            className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-none p-0"
                            value={formData.secondary_color}
                            onChange={e => handleColorChange('secondary_color', e.target.value)}
                          />
                       </div>
                       <div className="flex-1 relative">
                          <Hash className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                          <input 
                            type="text"
                            placeholder="#FFFFFF"
                            className="w-full pl-6 pr-2 bg-transparent border-none outline-none text-sm font-mono font-bold text-slate-700 uppercase"
                            value={formData.secondary_color}
                            onChange={e => handleColorChange('secondary_color', e.target.value)}
                            maxLength={7}
                          />
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-tight">
                  {editingBrandId ? 'Save Changes' : 'Launch Brand'}
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg uppercase tracking-tight">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandKitPage;
