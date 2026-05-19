import { Trophy, Flame } from 'lucide-react';

type Props = {
  streak: number;
  allDoneThisWeek: boolean;
};

export default function StreakBadge({ streak, allDoneThisWeek }: Props) {
  if (streak === 0 && !allDoneThisWeek) return null;

  const isGold = streak >= 2;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        isGold
          ? 'bg-amber-100 text-amber-700 border border-amber-300'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }`}
    >
      {isGold ? (
        <Trophy className="w-4 h-4 text-amber-500" />
      ) : (
        <Flame className="w-4 h-4 text-emerald-500" />
      )}
      <span>
        {isGold
          ? `Éducateur Or — ${streak} semaine${streak > 1 ? 's' : ''} de suite`
          : allDoneThisWeek
          ? 'Tous les référents rencontrés cette semaine !'
          : `Série en cours : ${streak} sem.`}
      </span>
    </div>
  );
}

export function getISOWeekYear(date: Date): { week: number; year: number } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, year: d.getFullYear() };
}

export function calculateStreak(completions: { year: number; week_number: number }[]): number {
  if (completions.length === 0) return 0;

  const sorted = [...completions].sort((a, b) =>
    b.year !== a.year ? b.year - a.year : b.week_number - a.week_number
  );

  const { week: currentWeek, year: currentYear } = getISOWeekYear(new Date());

  let streak = 0;
  let checkYear = currentYear;
  let checkWeek = currentWeek;

  for (const comp of sorted) {
    if (comp.year === checkYear && comp.week_number === checkWeek) {
      streak++;
      checkWeek--;
      if (checkWeek === 0) {
        checkYear--;
        checkWeek = 52;
      }
    } else {
      break;
    }
  }

  return streak;
}
