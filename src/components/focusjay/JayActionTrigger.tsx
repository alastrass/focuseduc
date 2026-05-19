import { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, CheckCircle } from 'lucide-react';

const DURATION_SEC = 5 * 60;
type Phase = 'idle' | 'running' | 'done';

export default function JayActionTrigger() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SEC);
  const [customTask, setCustomTask] = useState('');
  const [activeTask, setActiveTask] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            setPhase('done');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  const start = () => {
    setActiveTask(customTask.trim() || 'Quelque chose');
    setSecondsLeft(DURATION_SEC);
    setPhase('running');
  };

  const stop = () => {
    setPhase('idle');
    setSecondsLeft(DURATION_SEC);
    setActiveTask('');
  };

  const reset = () => {
    setPhase('idle');
    setSecondsLeft(DURATION_SEC);
    setActiveTask('');
    setCustomTask('');
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((DURATION_SEC - secondsLeft) / DURATION_SEC) * 100;
  const circleR = 88;
  const circumference = 2 * Math.PI * circleR;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {phase === 'idle' && (
        <div className="w-full max-w-sm space-y-4">
          <div
            className="p-6 rounded-3xl text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
          >
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Paralysé par la tâche ?
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Engage-toi pour seulement <strong>5 minutes</strong>. Juste commencer suffit.
            </p>
            <input
              type="text"
              value={customTask}
              onChange={(e) => setCustomTask(e.target.value)}
              placeholder="Quelle tâche ? (optionnel)"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-4"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
            />
            <button
              onClick={start}
              className="w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                color: 'var(--primary-text)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <Play className="w-5 h-5" />
              Démarrer 5 minutes
            </button>
          </div>
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'var(--surface-2)', border: '1px dashed var(--border)' }}
          >
            <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
              Le cerveau TDAH résiste au démarrage, pas à la continuation.
              <br />
              5 minutes, c'est tout ce qu'on te demande.
            </p>
          </div>
        </div>
      )}

      {phase === 'running' && (
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-52 h-52">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx={100} cy={100} r={circleR} fill="none" strokeWidth="8" style={{ stroke: 'var(--border)' }} />
              <circle
                cx={100} cy={100} r={circleR}
                fill="none" strokeWidth="8" strokeLinecap="round"
                style={{
                  stroke: 'var(--primary)',
                  strokeDasharray: circumference,
                  strokeDashoffset,
                  transition: 'stroke-dashoffset 1s linear',
                  filter: 'drop-shadow(0 0 6px var(--primary))',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-light tabular-nums" style={{ color: 'var(--text)' }}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>restantes</span>
            </div>
          </div>
          {activeTask && (
            <div
              className="px-6 py-3 rounded-2xl text-center max-w-xs"
              style={{ background: 'var(--primary-soft)', border: '1px solid var(--primary)' }}
            >
              <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: 'var(--text-faint)' }}>En cours</p>
              <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{activeTask}</p>
            </div>
          )}
          <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
            Concentre-toi. Juste 5 minutes. Tu peux le faire.
          </p>
          <button
            onClick={stop}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <Square className="w-4 h-4" />
            Arrêter
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div
          className="w-full max-w-sm p-8 rounded-3xl text-center space-y-4"
          style={{
            background: 'linear-gradient(135deg, var(--primary-soft) 0%, var(--surface) 100%)',
            border: '2px solid var(--primary)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <CheckCircle className="w-16 h-16 mx-auto" style={{ color: 'var(--primary)' }} />
          <h3 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Bravo !</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Tu as démarré <strong>{activeTask}</strong>.
            <br />
            5 minutes sont passées — veux-tu continuer ?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setSecondsLeft(DURATION_SEC); setPhase('running'); }}
              className="px-5 py-2.5 rounded-2xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
            >
              Encore 5 min
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm transition-all hover:opacity-70"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
            >
              <RotateCcw className="w-4 h-4" />
              Terminer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
