import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Brain, Folder, LogOut, Siren, ArrowLeftRight, Zap } from 'lucide-react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Referents from './components/Referents';
import FocusMode from './components/FocusMode';
import QuickCapture from './components/QuickCapture';
import ProjectsPage from './components/projects/ProjectsPage';
import SOSModal from './components/SOSModal';
import TimeBar from './components/TimeBar';
import ThemeSelector from './components/ThemeSelector';
import AppSelector from './components/AppSelector';
import FocusJay from './components/focusjay/FocusJay';
import { useTheme } from './contexts/ThemeContext';

type View = 'dashboard' | 'referents' | 'focus' | 'projects';
type AppMode = 'selector' | 'educ' | 'jay';

const NAV_ITEMS = [
  { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'referents' as View, label: 'Référents', icon: Users },
  { id: 'focus' as View, label: 'Focus Admin', icon: Brain },
  { id: 'projects' as View, label: 'Projets & Idées', icon: Folder },
];

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showSOS, setShowSOS] = useState(false);
  const [activeShift, setActiveShift] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<AppMode>('selector');
  const { setActiveSpace } = useTheme();

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAppMode('selector');
    });
    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAppMode('selector');
    setActiveSpace('educ');
  };

  const handleSelectSpace = (space: 'educ' | 'jay') => {
    setAppMode(space);
    setActiveSpace(space);
  };

  const handleLeaveToSelector = () => {
    setAppMode('selector');
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 20% 50%, #12093a 0%, #0a0814 40%, #050611 100%)' }}
      >
        <div
          className="bg-orb w-96 h-96"
          style={{ background: '#7c3aed', top: '-10%', left: '-5%', opacity: 0.12 }}
        />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl float-anim"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
              boxShadow: '0 0 30px rgba(124,58,237,0.5)',
            }}
          >
            <Zap className="w-6 h-6 text-white" />
          </div>
          <p style={{ color: 'rgba(240,238,255,0.35)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
            CHARGEMENT...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={checkUser} />;
  }

  if (appMode === 'selector') {
    return (
      <AppSelector
        onSelect={handleSelectSpace}
        userEmail={user.email}
        onSignOut={handleSignOut}
      />
    );
  }

  if (appMode === 'jay') {
    return (
      <FocusJay
        userId={user.id}
        onLeave={handleLeaveToSelector}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--bg-gradient, var(--bg))' }}
    >
      <div
        className="bg-orb"
        style={{
          width: '600px',
          height: '600px',
          background: 'var(--primary)',
          top: '-20%',
          left: '-15%',
          opacity: 0.07,
          filter: 'blur(120px)',
        }}
      />
      <div
        className="bg-orb"
        style={{
          width: '400px',
          height: '400px',
          background: 'var(--accent)',
          bottom: '-10%',
          right: '-10%',
          opacity: 0.06,
          filter: 'blur(100px)',
        }}
      />

      <TimeBar shift={activeShift} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                  boxShadow: 'var(--glow-sm)',
                }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                  FocusEduc
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  Espace professionnel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSelector space="educ" />
              <button
                onClick={handleLeaveToSelector}
                className="flex items-center gap-2 px-3 py-2 text-sm transition-all"
                style={{
                  color: 'var(--text-muted)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                title="Changer d'espace"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm transition-all"
                style={{
                  color: 'var(--text-muted)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>

          <div
            className="flex items-center gap-1 p-1 mb-6 w-fit"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all"
                style={
                  currentView === item.id
                    ? {
                        background: 'var(--nav-active-bg)',
                        color: 'var(--nav-active-text)',
                        borderRadius: 'calc(var(--radius) - 4px)',
                        boxShadow: 'var(--glow-sm)',
                      }
                    : {
                        background: 'transparent',
                        color: 'var(--nav-inactive)',
                        borderRadius: 'calc(var(--radius) - 4px)',
                      }
                }
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>

          <QuickCapture />
        </header>

        <main>
          {currentView === 'dashboard' && (
            <Dashboard onShiftChange={setActiveShift} userId={user.id} />
          )}
          {currentView === 'referents' && <Referents userId={user.id} />}
          {currentView === 'focus' && <FocusMode />}
          {currentView === 'projects' && <ProjectsPage />}
        </main>

        <footer className="mt-12 pt-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-faint)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            FocusEduc · Conçu par Jérôme Joly · Éducateur social
          </p>
        </footer>
      </div>

      <button
        onClick={() => setShowSOS(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(239,68,68,0.45), 0 0 40px rgba(239,68,68,0.2)',
          border: '1px solid rgba(239,68,68,0.3)',
        }}
        title="Protocoles d'urgence"
      >
        <Siren className="w-5 h-5" />
        <span className="text-sm font-medium">SOS</span>
      </button>

      {showSOS && <SOSModal onClose={() => setShowSOS(false)} />}
    </div>
  );
}

export default App;
