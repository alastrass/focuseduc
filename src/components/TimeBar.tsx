import { useEffect, useState } from 'react';

type ShiftConfig = {
  start: number;
  end: number;
  label: string;
};

const SHIFT_CONFIGS: Record<string, ShiftConfig> = {
  Matin: { start: 7 * 60, end: 14 * 60, label: '07:00 – 14:00' },
  'Après-midi': { start: 14 * 60, end: 21 * 60, label: '14:00 – 21:00' },
  Journée: { start: 7 * 60, end: 21 * 60, label: '07:00 – 21:00' },
};

const MARKERS = [
  { time: 8 * 60, label: 'Pdj' },
  { time: 12 * 60, label: 'Midi' },
  { time: 14 * 60 + 30, label: 'Relève' },
  { time: 18 * 60 + 30, label: 'Dîner' },
];

type Props = { shift: string | null };

export default function TimeBar({ shift }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!shift || !SHIFT_CONFIGS[shift]) {
    return <div className="fixed top-0 left-0 right-0 h-[3px] bg-slate-100 z-50" />;
  }

  const config = SHIFT_CONFIGS[shift];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const duration = config.end - config.start;
  const elapsed = Math.max(0, Math.min(currentMinutes - config.start, duration));
  const progress = (elapsed / duration) * 100;
  const isActive = currentMinutes >= config.start && currentMinutes <= config.end;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 group">
      <div className="relative h-[3px] bg-slate-200 overflow-visible">
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progress}%`,
            background: isActive
              ? 'linear-gradient(90deg, #10b981, #3b82f6)'
              : 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
          }}
        />

        {MARKERS.map((marker) => {
          const markerPos = ((marker.time - config.start) / duration) * 100;
          if (markerPos < 0 || markerPos > 100) return null;
          const isPast = currentMinutes >= marker.time;
          return (
            <div
              key={marker.time}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${markerPos}%`, transform: 'translateX(-50%)' }}
            >
              <div
                className="w-[2px] h-[5px]"
                style={{ background: isPast ? '#10b981' : '#94a3b8' }}
              />
              <span
                className="absolute top-[5px] text-[9px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: isPast ? '#10b981' : '#94a3b8' }}
              >
                {marker.label}
              </span>
            </div>
          );
        })}

        {isActive && progress > 0 && progress < 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-300"
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        )}
      </div>

      <div
        className="absolute right-2 top-[4px] text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
        title={config.label}
      >
        {Math.round(progress)}% du service
      </div>
    </div>
  );
}
