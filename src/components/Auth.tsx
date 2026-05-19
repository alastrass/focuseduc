import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 20% 50%, #12093a 0%, #0a0814 40%, #050611 100%)' }}
    >
      <div
        className="bg-orb w-96 h-96"
        style={{ background: '#7c3aed', top: '-10%', left: '-5%', opacity: 0.15 }}
      />
      <div
        className="bg-orb w-80 h-80"
        style={{ background: '#06b6d4', bottom: '5%', right: '-5%', opacity: 0.12 }}
      />
      <div
        className="bg-orb w-64 h-64"
        style={{ background: '#3b82f6', top: '60%', left: '30%', opacity: 0.08 }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-2xl float-anim"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.2)',
              }}
            >
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1
            className="text-4xl font-bold tracking-tight mb-2"
            style={{ color: '#f0eeff' }}
          >
            Focus<span className="gradient-text">Educ</span>
          </h1>
          <p style={{ color: 'rgba(240,238,255,0.45)', fontSize: '0.9rem' }}>
            {isSignUp ? 'Créer votre espace de travail' : 'Bienvenue, éducateur'}
          </p>
        </div>

        <div
          className="card p-8 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
              transform: 'translate(20%, -20%)',
            }}
          />

          <form onSubmit={handleAuth} className="space-y-5 relative z-10">
            <div>
              <label
                className="block text-xs font-medium mb-2 tracking-widest uppercase"
                style={{ color: 'rgba(240,238,255,0.4)' }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'rgba(240,238,255,0.3)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  style={{
                    width: '100%',
                    padding: '13px 16px 13px 44px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#f0eeff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    outline: 'none',
                    display: 'block',
                    boxSizing: 'border-box',
                    fontSize: '0.95rem',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(124,58,237,0.6)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-2 tracking-widest uppercase"
                style={{ color: 'rgba(240,238,255,0.4)' }}
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'rgba(240,238,255,0.3)' }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '13px 16px 13px 44px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#f0eeff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    outline: 'none',
                    display: 'block',
                    boxSizing: 'border-box',
                    fontSize: '0.95rem',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(124,58,237,0.6)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {error && (
              <div
                className="px-4 py-3 text-sm rounded-xl"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                color: '#ffffff',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 30px rgba(124,58,237,0.35)',
                fontSize: '0.95rem',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(124,58,237,0.55)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(124,58,237,0.35)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <span>Chargement...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Créer mon compte' : 'Se connecter'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-sm transition-all hover:opacity-100"
                style={{
                  color: 'rgba(240,238,255,0.35)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(196,181,253,0.8)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,238,255,0.35)'; }}
              >
                {isSignUp
                  ? 'Déjà un compte ? Se connecter'
                  : 'Pas de compte ? Créer un compte'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            CONÇU PAR JÉRÔME JOLY · ÉDUCATEUR SOCIAL
          </p>
        </div>
      </div>
    </div>
  );
}
