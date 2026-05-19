import { useState } from 'react';
import { Briefcase, Sparkles, ArrowRight, LogOut } from 'lucide-react';
import { AppSpace } from '../contexts/ThemeContext';

type Props = {
  onSelect: (space: AppSpace) => void;
  userEmail?: string;
  onSignOut?: () => void;
};

export default function AppSelector({ onSelect, userEmail, onSignOut }: Props) {
  const [hovered, setHovered] = useState<AppSpace | null>(null);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 25% 40%, #12093a 0%, #0a0814 45%, #050611 100%)',
      }}
    >
      <div
        className="bg-orb"
        style={{
          width: '500px',
          height: '500px',
          background: '#7c3aed',
          top: '-15%',
          left: '-10%',
          opacity: 0.12,
          filter: 'blur(100px)',
        }}
      />
      <div
        className="bg-orb"
        style={{
          width: '400px',
          height: '400px',
          background: '#06b6d4',
          bottom: '-10%',
          right: '-5%',
          opacity: 0.1,
          filter: 'blur(100px)',
        }}
      />
      <div
        className="bg-orb"
        style={{
          width: '300px',
          height: '300px',
          background: '#ec4899',
          bottom: '20%',
          left: '60%',
          opacity: 0.08,
          filter: 'blur(80px)',
        }}
      />

      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.4) 50%, transparent 100%)',
        }}
      />

      {onSignOut && (
        <button
          onClick={onSignOut}
          className="absolute top-6 right-6 flex items-center gap-2 text-sm transition-all"
          style={{
            color: 'rgba(240,238,255,0.3)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            padding: '8px 14px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,238,255,0.6)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,238,255,0.3)'; }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Déconnexion
        </button>
      )}

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-14">
          {userEmail && (
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }}
              />
              <span style={{ color: 'rgba(240,238,255,0.45)', fontSize: '0.8rem' }}>
                {userEmail}
              </span>
            </div>
          )}
          <h1
            className="text-5xl font-bold tracking-tight mb-3"
            style={{ color: '#f0eeff' }}
          >
            Bonjour, <span className="gradient-text">Jérôme</span>
          </h1>
          <p
            className="text-lg"
            style={{ color: 'rgba(240,238,255,0.38)', fontWeight: 300 }}
          >
            Quel espace souhaitez-vous ouvrir ?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onSelect('educ')}
            onMouseEnter={() => setHovered('educ')}
            onMouseLeave={() => setHovered(null)}
            className="group relative flex flex-col items-start p-8 text-left"
            style={{
              background: hovered === 'educ'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(255,255,255,0.03)',
              border: hovered === 'educ'
                ? '1px solid rgba(99,102,241,0.35)'
                : '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              backdropFilter: 'blur(20px)',
              boxShadow: hovered === 'educ'
                ? '0 0 0 1px rgba(99,102,241,0.2), 0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.12)'
                : '0 8px 32px rgba(0,0,0,0.3)',
              transform: hovered === 'educ' ? 'translateY(-3px)' : 'translateY(0)',
              transition: 'all 0.25s ease',
              cursor: 'pointer',
            }}
          >
            <div
              className="flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(59,130,246,0.2) 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                boxShadow: hovered === 'educ' ? '0 0 20px rgba(99,102,241,0.4)' : '0 0 0px transparent',
                transition: 'box-shadow 0.25s ease',
              }}
            >
              <Briefcase className="w-6 h-6" style={{ color: '#818cf8' }} />
            </div>

            <div className="flex-1">
              <div
                className="text-xs font-medium tracking-widest uppercase mb-1.5"
                style={{ color: '#818cf8', opacity: 0.8 }}
              >
                Espace professionnel
              </div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#f0eeff' }}>
                FocusEduc
              </h2>
              <p className="text-sm mb-5" style={{ color: 'rgba(240,238,255,0.4)', lineHeight: 1.6 }}>
                Dashboard, gestion d'équipe et outils de travail
              </p>
              <ul className="space-y-2">
                {['Dashboard & équipe', 'Focus Admin (Pomodoro)', 'Projets & Idées', 'Protocoles SOS'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs" style={{ color: 'rgba(240,238,255,0.35)' }}>
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: '#818cf8' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="mt-7 flex items-center gap-2 text-sm font-medium"
              style={{
                color: hovered === 'educ' ? '#818cf8' : 'rgba(240,238,255,0.3)',
                transition: 'color 0.2s ease',
              }}
            >
              Ouvrir l'espace
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200"
                style={{ transform: hovered === 'educ' ? 'translateX(4px)' : 'translateX(0)' }}
              />
            </div>

            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                transform: 'translate(25%, -25%)',
              }}
            />
          </button>

          <button
            onClick={() => onSelect('jay')}
            onMouseEnter={() => setHovered('jay')}
            onMouseLeave={() => setHovered(null)}
            className="group relative flex flex-col items-start p-8 text-left"
            style={{
              background: hovered === 'jay'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(255,255,255,0.03)',
              border: hovered === 'jay'
                ? '1px solid rgba(236,72,153,0.35)'
                : '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              backdropFilter: 'blur(20px)',
              boxShadow: hovered === 'jay'
                ? '0 0 0 1px rgba(236,72,153,0.2), 0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(236,72,153,0.12)'
                : '0 8px 32px rgba(0,0,0,0.3)',
              transform: hovered === 'jay' ? 'translateY(-3px)' : 'translateY(0)',
              transition: 'all 0.25s ease',
              cursor: 'pointer',
            }}
          >
            <div
              className="flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(249,115,22,0.2) 100%)',
                border: '1px solid rgba(236,72,153,0.3)',
                boxShadow: hovered === 'jay' ? '0 0 20px rgba(236,72,153,0.4)' : '0 0 0px transparent',
                transition: 'box-shadow 0.25s ease',
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: '#f472b6' }} />
            </div>

            <div className="flex-1">
              <div
                className="text-xs font-medium tracking-widest uppercase mb-1.5"
                style={{ color: '#f472b6', opacity: 0.8 }}
              >
                Espace vie privée
              </div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#f0eeff' }}>
                FocusJay
              </h2>
              <p className="text-sm mb-5" style={{ color: 'rgba(240,238,255,0.4)', lineHeight: 1.6 }}>
                Vie personnelle, bien-être et équilibre
              </p>
              <ul className="space-y-2">
                {['ToDo par catégories', 'Semaine Zen', 'Cercle Social', "Menu Dopamine", "Déclencheur d'Action"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs" style={{ color: 'rgba(240,238,255,0.35)' }}>
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: '#f472b6' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="mt-7 flex items-center gap-2 text-sm font-medium"
              style={{
                color: hovered === 'jay' ? '#f472b6' : 'rgba(240,238,255,0.3)',
                transition: 'color 0.2s ease',
              }}
            >
              Ouvrir l'espace
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200"
                style={{ transform: hovered === 'jay' ? 'translateX(4px)' : 'translateX(0)' }}
              />
            </div>

            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
                transform: 'translate(25%, -25%)',
              }}
            />
          </button>
        </div>

        <div className="mt-10 text-center">
          <p
            style={{
              color: 'rgba(240,238,255,0.18)',
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            FocusEduc · Conçu par Jérôme Joly · Éducateur social
          </p>
        </div>
      </div>
    </div>
  );
}
