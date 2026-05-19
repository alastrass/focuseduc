import { useState, useEffect } from 'react';
import { Zap, X, TrendingUp } from 'lucide-react';
import { supabase, EnergyLog } from '../lib/supabase';

const ENERGY_LEVELS = [
  { score: 1, emoji: '😫', label: 'Épuisé', color: '#ef4444' },
  { score: 2, emoji: '😔', label: 'Fatigué', color: '#f97316' },
  { score: 3, emoji: '😐', label: 'Correct', color: '#eab308' },
  { score: 4, emoji: '😊', label: 'En forme', color: '#22c55e' },
  { score: 5, emoji: '⚡', label: 'Pleine énergie', color: '#10b981' },
];

const LOW_ENERGY_MSG = "Ton énergie est basse aujourd'hui — pense à prioriser uniquement l'essentiel. Prends soin de toi.";

type Props = {
  shift: string;
  logType: 'start' | 'end';
  userId: string;
  onClose: () => void;
};

function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, year: d.getFullYear() };
}

function EnergyMiniChart({ logs }: { logs: EnergyLog[] }) {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayLogs = logs.filter((l) => l.created_at.slice(0, 10) === dateStr);
    const avg = dayLogs.length ? dayLogs.reduce((s, l) => s + l.score, 0) / dayLogs.length : null;
    return {
      day: ['L', 'M', 'M', 'J', 'V', 'S', 'D'][d.getDay() === 0 ? 6 : d.getDay() - 1],
      avg,
      isToday: i === 6,
    };
  });

  const W = 200;
  const H = 60;
  const barW = 20;
  const gap = (W - 7 * barW) / 8;

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        Tendance des 7 derniers jours
      </p>
      <svg width={W} height={H + 20} className="w-full max-w-[200px] mx-auto block">
        {last7.map((d, i) => {
          const x = gap + i * (barW + gap);
          const barHeight = d.avg ? (d.avg / 5) * H : 0;
          const y = H - barHeight;
          const color = d.avg
            ? d.avg <= 2 ? '#ef4444' : d.avg <= 3 ? '#eab308' : '#10b981'
            : '#e2e8f0';
          return (
            <g key={i}>
              <rect x={x} y={d.avg ? y : H - 4} width={barW} height={d.avg ? barHeight : 4}
                rx={4} fill={color} opacity={d.isToday ? 1 : 0.6} />
              <text x={x + barW / 2} y={H + 14} textAnchor="middle"
                fontSize={9} fill={d.isToday ? '#1e293b' : '#94a3b8'} fontWeight={d.isToday ? '600' : '400'}>
                {d.day}
              </text>
              {d.avg && (
                <text x={x + barW / 2} y={y - 3} textAnchor="middle"
                  fontSize={8} fill={color} fontWeight="600">
                  {d.avg.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function EnergyModal({ shift, logType, userId, onClose }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [recentLogs, setRecentLogs] = useState<EnergyLog[]>([]);

  useEffect(() => {
    loadRecentLogs();
  }, []);

  const loadRecentLogs = async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('energy_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo)
      .order('created_at');
    if (data) setRecentLogs(data);
  };

  const saveEnergy = async (score: number) => {
    setSelected(score);
    await supabase.from('energy_logs').insert({
      user_id: userId,
      shift_name: shift,
      score,
      log_type: logType,
    });
    setSaved(true);
    await loadRecentLogs();
  };

  const showLowWarning = saved && selected !== null && selected <= 2;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="font-medium text-slate-700 text-sm">
                {logType === 'start' ? 'Début de service' : 'Fin de service'} — {shift}
              </p>
              <p className="text-xs text-slate-400">Comment tu te sens ?</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          {!saved ? (
            <div className="grid grid-cols-5 gap-2">
              {ENERGY_LEVELS.map((level) => (
                <button
                  key={level.score}
                  onClick={() => saveEnergy(level.score)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:scale-110 transition-all active:scale-95 border-2 border-transparent hover:border-slate-200"
                  title={level.label}
                >
                  <span className="text-2xl">{level.emoji}</span>
                  <span className="text-[9px] text-slate-400 text-center leading-tight">{level.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-4xl">{ENERGY_LEVELS[(selected ?? 3) - 1]?.emoji}</span>
              <p className="text-sm font-medium text-slate-700 mt-2">
                {ENERGY_LEVELS[(selected ?? 3) - 1]?.label}
              </p>
              {showLowWarning && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <p className="text-xs text-amber-700 leading-relaxed">{LOW_ENERGY_MSG}</p>
                </div>
              )}
              <EnergyMiniChart logs={recentLogs} />
              <button
                onClick={onClose}
                className="mt-4 w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Bonne journée
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
