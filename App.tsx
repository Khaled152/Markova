
import React, { useState, useEffect, createContext, useContext, Component, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { User, UserRole, LanguageContextType } from './types';
import { DICTIONARY } from './constants';
import { supabase } from './services/supabase';

// Components & Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import BrandKitPage from './pages/BrandKitPage';
import CampaignGeneratorPage from './pages/CampaignGeneratorPage';
import StrategicPlanPage from './pages/StrategicPlanPage';
import CampaignHistoryPage from './pages/CampaignHistoryPage';
import CampaignDetailsPage from './pages/CampaignDetailsPage';
import ImageGeneratorPage from './pages/ImageGeneratorPage';
import VideoGeneratorPage from './pages/VideoGeneratorPage';
import SinglePostPage from './pages/SinglePostPage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import { LogOut, User as UserIcon, Settings, LayoutDashboard, Sparkles, FolderHeart, ShieldCheck, Globe, ImageIcon, Loader2, Compass, AlertCircle, Video } from 'lucide-react';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};

const AuthContext = createContext<{ 
  user: User | null; 
  setUser: (u: User | null) => void;
  isLoading: boolean;
} | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// Define explicit interfaces for ErrorBoundary props and state
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Global Error Boundary to prevent total White Screens
// Fix: Use React.Component to resolve TypeScript inference issues with 'props' and 'children'
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  // Handle potential errors by updating state
  static getDerivedStateFromError(_error: Error): ErrorBoundaryState { 
    return { hasError: true }; 
  }

  render() {
    // Access state directly from this.state
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center p-10 bg-slate-50 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase">Application Error</h1>
          <p className="text-slate-500 mb-6">A critical system error occurred. Please refresh your browser.</p>
          <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold">Reload Markova</button>
        </div>
      );
    }
    // Correctly access children from this.props which is inherited from React.Component
    return this.props.children;
  }
}

export const MarkovaLogo: React.FC<{ size?: 'sm' | 'md' | 'lg', showText?: boolean }> = ({ size = 'md', showText = true }) => {
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl';
  
  return (
    <div className="flex items-center gap-3">
      <div className={`${iconSize} relative shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="25" cy="45" r="10" fill="#0026FF" />
          <rect x="48" y="20" width="18" height="60" rx="9" transform="rotate(22 57 50)" fill="#0026FF" />
        </svg>
      </div>
      {showText && <span className={`${textSize} font-black tracking-tight text-slate-900`}>MARKOVA</span>}
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, isLoading } = useAuth();
  const { language, setLanguage, dir, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem('supabase.auth.token');
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Authenticating Markova...</p>
      </div>
    );
  }

  if (!user) return <>{children}</>;

  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div className="flex h-screen overflow-hidden" dir={dir}>
      {/* Sidebar */}
      <aside className={`w-64 bg-white border-${dir === 'ltr' ? 'r' : 'l'} border-slate-200 hidden md:flex flex-col shadow-sm z-20`}>
        <div className="p-6">
          <Link to="/dashboard">
            <MarkovaLogo size="sm" />
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
            <LayoutDashboard className="w-5 h-5" />
            {t('dashboard')}
          </Link>
          <Link to="/brand-kit" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
            <FolderHeart className="w-5 h-5" />
            {t('brandKits')}
          </Link>
          <Link to="/generator" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
            <Sparkles className="w-5 h-5" />
            {t('generator')}
          </Link>
          <Link to="/strategy" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
            <Compass className="w-5 h-5" />
            {t('strategicPlanner')}
          </Link>
          <Link to="/image-gen" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
            <ImageIcon className="w-5 h-5" />
            Studio
          </Link>
          <Link to="/video-gen" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
            <Video className="w-5 h-5" />
            Reels
          </Link>
          <Link to="/history" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
            <Settings className="w-5 h-5" />
            {t('history')}
          </Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-indigo-600 font-black hover:bg-indigo-50 rounded-xl transition-all mt-6 uppercase text-[10px] tracking-widest">
              <ShieldCheck className="w-5 h-5" />
              {t('admin')}
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
             <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black border border-indigo-100">
                {user.name?.[0]?.toUpperCase() || <UserIcon className="w-5 h-5" />}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-widest">{user.plan_id} Access</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-auto relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-10">
           <h1 className="font-black text-slate-900 text-sm uppercase tracking-widest">Markova Workspace</h1>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="px-3 py-1.5 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
              >
                <Globe className="w-3.5 h-3.5" />
                {language === 'en' ? 'Arabic' : 'English'}
              </button>
           </div>
        </header>
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const t = (key: string) => DICTIONARY[language][key] || key;
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const fetchProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();
      
      if (data) {
        setUser(data);
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata.name || authUser.email?.split('@')[0] || 'User',
            role: UserRole.USER,
            plan_id: 'free',
            subscription_status: 'inactive',
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error("Profile Fetch Failed:", err);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user.id);
      }
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    initializeAuth();
    return () => subscription.unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, setUser, isLoading }}>
        <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
          <HashRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/brand-kit" element={user ? <BrandKitPage /> : <Navigate to="/login" />} />
                <Route path="/generator" element={user ? <CampaignGeneratorPage /> : <Navigate to="/login" />} />
                <Route path="/strategy" element={user ? <StrategicPlanPage /> : <Navigate to="/login" />} />
                <Route path="/image-gen" element={user ? <ImageGeneratorPage /> : <Navigate to="/login" />} />
                <Route path="/video-gen" element={user ? <VideoGeneratorPage /> : <Navigate to="/login" />} />
                <Route path="/history" element={user ? <CampaignHistoryPage /> : <Navigate to="/login" />} />
                <Route path="/campaign/:id" element={user ? <CampaignDetailsPage /> : <Navigate to="/login" />} />
                <Route path="/post/:campaignId/:postId" element={user ? <SinglePostPage /> : <Navigate to="/login" />} />
                <Route path="/admin" element={user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          </HashRouter>
        </LanguageContext.Provider>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
