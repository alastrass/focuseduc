import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Save, Flame, AlertTriangle, Maximize, Minimize } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Mode = 'orange' | 'red';

const DURATIONS = [5, 10, 15, 20, 25, 30];

const MESSAGES: Record<Mode, { fr: string; de: string }> = {
  orange: {
    fr: "Je peux être dérangé si cela est utile. Je suis en mode 'concentration moyen' jusqu'à la fin du chronomètre.",
    de: 'Man kann mich gerne stören, wenn es nötig ist. Ich bin bis zum Ablauf der Zeit im Modus „mittlere Konzentration".',
  },
  red: {
    fr: "Merci de ne déranger qu'en cas de besoin urgent. Je suis en mode concentration 'Maximum' jusqu'à la fin du chronomètre.",
    de: 'Bitte störe mich nur, wenn es dringend ist. Ich bin bis zum Ablauf der Zeit auf „Maximalkonzentration" eingestellt.',
  },
};

const MODE_STYLES: Record<Mode, {
  base: string;
  glow: string;
  accent: string;
  label: string;
  labelDe: string;
  icon: typeof Flame;
}> = {
  orange: {
    base: '#ff8800',
    glow: '#ffb347',
    accent: '#ffdd55',
    label: 'CONCENTRATION MOYENNE',
    labelDe: 'MITTLERE KONZENTRATION',
    icon: Flame,
  },
  red: {
    base: '#ff1744',
    glow: '#ff4466',
    accent: '#ff6688',
    label: 'CONCENTRATION MAXIMUM',
    labelDe: 'MAXIMALKONZENTRATION',
    icon: AlertTriangle,
  },
};

export default function FocusMode() {
  const [mode, setMode] = useState<Mode>('orange');
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const [sessionNotes, setSessionNotes] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 250);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const handleComplete = async () => {
    setIsRunning(false);
    if (userId) {
      await supabase.from('admin_sessions').insert({
        user_id: userId,
        duration: Math.round(totalSeconds / 60),
        completed: true,
        notes: sessionNotes,
      });
    }
  };

  const startWithDuration = (minutes: number) => {
    const secs = minutes * 60;
    setSelectedDuration(minutes);
    setTotalSeconds(secs);
    setTimeLeft(secs);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    if (timeLeft === 0) setTimeLeft(totalSeconds);
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  };

  const saveSession = async () => {
    if (!userId) return;
    const elapsedMinutes = Math.max(1, Math.floor((totalSeconds - timeLeft) / 60));
    await supabase.from('admin_sessions').insert({
      user_id: userId,
      duration: elapsedMinutes,
      completed: false,
      notes: sessionNotes,
    });
    setSessionNotes('');
    resetTimer();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const style = MODE_STYLES[mode];
  const msg = MESSAGES[mode];
  const Icon = style.icon;

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
        style={{
          background: `linear-gradient(135deg, ${style.base} 0%, ${style.glow} 50%, ${style.base} 100%)`,
          boxShadow: `inset 0 0 200px ${style.accent}55`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, ${style.accent}55 0%, transparent 65%)`,
            animation: 'fogPulse 3s ease-in-out infinite',
          }}
        />

        <div
          className="absolute bottom-0 left-0 h-3 pointer-events-none"
          style={{
            width: `${progress}%`,
            background: '#ffffff',
            boxShadow: `0 0 30px #fff, 0 0 60px ${style.accent}`,
            transition: 'width 0.25s linear',
          }}
        />

        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wide transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.5)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '13px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Minimize className="w-4 h-4" />
          Quitter
        </button>

        <div className="relative z-10 flex flex-col items-center text-center max-w-6xl w-full">
          <div className="flex items-center gap-3 mb-6">
            <Icon className="w-8 h-8 text-white drop-shadow-lg" />
            <span
              className="font-black uppercase text-white drop-shadow-lg"
              style={{ fontSize: 'clamp(16px, 2vw, 22px)', letterSpacing: '0.22em' }}
            >
              {style.label} / {style.labelDe}
            </span>
          </div>

          <div
            className="font-black tabular-nums text-white mb-10 leading-none"
            style={{
              fontSize: 'clamp(160px, 28vw, 380px)',
              fontWeight: 900,
              textShadow: `0 0 40px ${style.accent}, 0 0 80px rgba(255,255,255,0.55), 0 8px 24px rgba(0,0,0,0.3)`,
              letterSpacing: '-0.03em',
            }}
          >
            {formatTime(timeLeft)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div
              className="rounded-2xl p-6 backdrop-blur-sm"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '3px solid rgba(255,255,255,0.4)',
              }}
            >
              <div
                className="text-sm font-black uppercase text-white mb-3 opacity-90"
                style={{ letterSpacing: '0.25em' }}
              >
                FR
              </div>
              <p
                className="text-white leading-snug"
                style={{
                  fontSize: 'clamp(18px, 2vw, 26px)',
                  fontWeight: 900,
                  textShadow: '0 2px 8px rgba(0,0,0,0.35)',
                }}
              >
                {msg.fr}
              </p>
            </div>
            <div
              className="rounded-2xl p-6 backdrop-blur-sm"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '3px solid rgba(255,255,255,0.4)',
              }}
            >
              <div
                className="text-sm font-black uppercase text-white mb-3 opacity-90"
                style={{ letterSpacing: '0.25em' }}
              >
                DE
              </div>
              <p
                className="text-white leading-snug"
                style={{
                  fontSize: 'clamp(18px, 2vw, 26px)',
                  fontWeight: 900,
                  textShadow: '0 2px 8px rgba(0,0,0,0.35)',
                }}
              >
                {msg.de}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light mb-2" style={{ color: 'var(--text)' }}>
          Mode Focus Administratif
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Signale ton niveau de concentration aux collègues
        </p>
      </div>

      {/* ZONE 1 — Chronomètre + Signalétique */}
      <div
        className="card p-5"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Lancer en un clic
          </span>
          <span
            className="text-xs tabular-nums font-semibold"
            style={{ color: 'var(--text-faint)' }}
          >
            Sélection : {selectedDuration} min
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {DURATIONS.map((m) => {
            const active = selectedDuration === m;
            return (
              <button
                key={m}
                onClick={() => startWithDuration(m)}
                className="py-3 font-bold transition-all hover:scale-105 active:scale-95"
                style={{
                  background: active ? style.base : 'var(--surface-2)',
                  color: active ? '#fff' : 'var(--text)',
                  border: `2px solid ${active ? style.base : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  boxShadow: active ? `0 0 16px ${style.base}66` : 'none',
                  cursor: 'pointer',
                  fontSize: '15px',
                }}
              >
                {m} min
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('orange')}
            className="relative py-3 font-bold uppercase tracking-wide transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: mode === 'orange' ? MODE_STYLES.orange.base : 'var(--surface-2)',
              color: mode === 'orange' ? '#fff' : 'var(--text)',
              border: `2px solid ${mode === 'orange' ? MODE_STYLES.orange.base : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              boxShadow: mode === 'orange' ? `0 0 24px ${MODE_STYLES.orange.base}77` : 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <Flame className="w-5 h-5" />
            Mode Orange
          </button>
          <button
            onClick={() => setMode('red')}
            className="relative py-3 font-bold uppercase tracking-wide transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: mode === 'red' ? MODE_STYLES.red.base : 'var(--surface-2)',
              color: mode === 'red' ? '#fff' : 'var(--text)',
              border: `2px solid ${mode === 'red' ? MODE_STYLES.red.base : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              boxShadow: mode === 'red' ? `0 0 24px ${MODE_STYLES.red.base}77` : 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <AlertTriangle className="w-5 h-5" />
            Mode Rouge
          </button>
        </div>
      </div>

      {/* Rectangle signalétique */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 'var(--radius-lg)',
          background: `linear-gradient(135deg, ${style.base} 0%, ${style.glow} 50%, ${style.base} 100%)`,
          boxShadow: `0 0 80px ${style.base}99, 0 0 40px ${style.glow}aa, inset 0 0 60px ${style.accent}33`,
          border: `3px solid ${style.accent}`,
          padding: '32px 28px',
          minHeight: '340px',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${style.accent}55 0%, transparent 70%)`,
            animation: 'fogPulse 3s ease-in-out infinite',
          }}
        />

        <div
          className="absolute bottom-0 left-0 h-2 pointer-events-none"
          style={{
            width: `${progress}%`,
            background: '#ffffff',
            boxShadow: `0 0 24px #ffffff, 0 0 48px ${style.accent}`,
            transition: 'width 0.25s linear',
          }}
        />

        <button
          onClick={() => setFullscreen(true)}
          className="absolute top-4 right-4 p-2.5 transition-all hover:scale-110 active:scale-95 z-20"
          style={{
            background: 'rgba(0,0,0,0.25)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.45)',
            borderRadius: '10px',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
          }}
          title="Plein écran"
        >
          <Maximize className="w-5 h-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-3">
            <Icon className="w-6 h-6 text-white drop-shadow-lg" />
            <span
              className="font-black uppercase text-white drop-shadow-lg"
              style={{ fontSize: '15px', letterSpacing: '0.18em' }}
            >
              {style.label} / {style.labelDe}
            </span>
          </div>

          <div
            className="font-black tabular-nums text-white mb-4 leading-none"
            style={{
              fontSize: 'clamp(72px, 14vw, 140px)',
              fontWeight: 900,
              textShadow: `0 0 24px ${style.accent}, 0 0 48px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.25)`,
              letterSpacing: '-0.02em',
            }}
          >
            {formatTime(timeLeft)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full mt-2">
            <div
              className="rounded-xl p-4 backdrop-blur-sm"
              style={{
                background: 'rgba(0,0,0,0.22)',
                border: '2px solid rgba(255,255,255,0.35)',
              }}
            >
              <div
                className="text-xs font-black uppercase text-white mb-2 opacity-90"
                style={{ letterSpacing: '0.2em' }}
              >
                FR
              </div>
              <p
                className="text-white leading-snug"
                style={{
                  fontSize: '17px',
                  fontWeight: 900,
                  textShadow: '0 2px 6px rgba(0,0,0,0.35)',
                }}
              >
                {msg.fr}
              </p>
            </div>
            <div
              className="rounded-xl p-4 backdrop-blur-sm"
              style={{
                background: 'rgba(0,0,0,0.22)',
                border: '2px solid rgba(255,255,255,0.35)',
              }}
            >
              <div
                className="text-xs font-black uppercase text-white mb-2 opacity-90"
                style={{ letterSpacing: '0.2em' }}
              >
                DE
              </div>
              <p
                className="text-white leading-snug"
                style={{
                  fontSize: '17px',
                  fontWeight: 900,
                  textShadow: '0 2px 6px rgba(0,0,0,0.35)',
                }}
              >
                {msg.de}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={toggleTimer}
              className="flex items-center gap-2 px-7 py-3 font-black uppercase tracking-wide transition-all hover:scale-105 active:scale-95"
              style={{
                background: '#ffffff',
                color: style.base,
                borderRadius: 'var(--radius)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {isRunning ? (
                <><Pause className="w-5 h-5" /> Pause</>
              ) : (
                <><Play className="w-5 h-5" /> Démarrer</>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center gap-2 px-5 py-3 font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                borderRadius: 'var(--radius)',
                border: '2px solid rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ZONE 2 — Notes rapides de session */}
      <div
        className="card p-5"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <label className="block text-sm font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
          Notes rapides de session
        </label>
        <textarea
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Spécifique à la session en cours — avancées, blocages, idées..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'var(--input-bg)',
            color: 'var(--text)',
            border: '1px solid var(--input-border)',
            borderRadius: 'var(--radius)',
            outline: 'none',
            resize: 'vertical',
            display: 'block',
            boxSizing: 'border-box',
            fontSize: '14px',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--input-focus)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--input-border)')}
        />
        <button
          onClick={saveSession}
          disabled={!userId}
          className="mt-3 w-full px-6 py-3 flex items-center justify-center gap-2 font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-text)',
            borderRadius: 'var(--radius)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Save className="w-5 h-5" />
          Sauvegarder la session
        </button>
      </div>
    </div>
  );
}
