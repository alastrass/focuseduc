import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, UserPlus, Trash2 } from 'lucide-react';
import { supabase, Referent, ReferentWeeklyCompletion } from '../lib/supabase';
import StreakBadge, { getISOWeekYear, calculateStreak } from './StreakBadge';
import Confetti, { useConfetti } from './Confetti';

type Props = {
  userId: string;
};

export default function Referents({ userId }: Props) {
  const [referents, setReferents] = useState<Referent[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [_completions, setCompletions] = useState<ReferentWeeklyCompletion[]>([]);
  const [streak, setStreak] = useState(0);
  const [allDoneThisWeek, setAllDoneThisWeek] = useState(false);
  const { trigger: triggerConfetti, particles } = useConfetti();

  useEffect(() => {
    if (userId) {
      loadReferents();
      loadCompletions();
    }
  }, [userId]);

  const loadReferents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('referents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    if (data) setReferents(data);
    setLoading(false);
  };

  const loadCompletions = async () => {
    const { data } = await supabase
      .from('referent_weekly_completions')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: false })
      .order('week_number', { ascending: false });

    if (data) {
      setCompletions(data);
      const s = calculateStreak(data);
      setStreak(s);
      const { week, year } = getISOWeekYear(new Date());
      setAllDoneThisWeek(data.some((c) => c.year === year && c.week_number === week));
    }
  };

  const addReferent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !userId) return;

    const { data } = await supabase
      .from('referents')
      .insert({ name: newName.trim(), user_id: userId, weekly_meeting_done: false })
      .select()
      .single();

    if (data) {
      setReferents([...referents, data]);
      setNewName('');
    }
  };

  const toggleMeeting = async (referent: Referent) => {
    const newStatus = !referent.weekly_meeting_done;
    const { data } = await supabase
      .from('referents')
      .update({
        weekly_meeting_done: newStatus,
        last_meeting_date: newStatus ? new Date().toISOString() : referent.last_meeting_date,
      })
      .eq('id', referent.id)
      .select()
      .single();

    if (data) {
      const updated = referents.map((r) => (r.id === referent.id ? data : r));
      setReferents(updated);

      if (newStatus && updated.length > 0 && updated.every((r) => r.weekly_meeting_done)) {
        const { week, year } = getISOWeekYear(new Date());
        await supabase
          .from('referent_weekly_completions')
          .upsert(
            { user_id: userId, year, week_number: week },
            { onConflict: 'user_id,year,week_number' }
          );
        triggerConfetti();
        await loadCompletions();
      }
    }
  };

  const deleteReferent = async (id: string) => {
    await supabase.from('referents').delete().eq('id', id);
    setReferents(referents.filter((r) => r.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div style={{ color: 'var(--text-faint)' }}>Chargement...</div>
      </div>
    );
  }

  const doneCount = referents.filter((r) => r.weekly_meeting_done).length;
  const totalCount = referents.length;

  return (
    <div className="space-y-6">
      <Confetti particles={particles} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-light" style={{ color: 'var(--text)' }}>
            Mes Référents
          </h2>
          {(streak > 0 || allDoneThisWeek) && (
            <StreakBadge streak={streak} allDoneThisWeek={allDoneThisWeek} />
          )}
        </div>
        <form onSubmit={addReferent} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de l'habitant"
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'var(--input-bg)',
              color: 'var(--text)',
              border: '1px solid var(--input-border)',
              borderRadius: 'var(--radius)',
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--input-focus)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--input-border)')}
          />
          <button
            type="submit"
            className="btn-primary px-6 py-3 flex items-center gap-2 font-medium transition-all hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-text)',
              borderRadius: 'var(--radius)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <UserPlus className="w-5 h-5" />
            Ajouter
          </button>
        </form>
      </div>

      <div
        className="card p-6"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium" style={{ color: 'var(--text)' }}>
            Rencontres Hebdomadaires
          </h3>
          {totalCount > 0 && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {doneCount}/{totalCount}
            </span>
          )}
        </div>

        {totalCount > 0 && (
          <div
            className="mb-4 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--surface-2)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
                background: 'var(--primary)',
              }}
            />
          </div>
        )}

        {referents.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-faint)' }}>
            Aucun référent ajouté pour le moment
          </p>
        ) : (
          <div className="space-y-2">
            {referents.map((referent) => (
              <div
                key={referent.id}
                className="flex items-center gap-3 p-3 transition-all"
                style={{ borderRadius: 'var(--radius-sm)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-2)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <button
                  onClick={() => toggleMeeting(referent)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {referent.weekly_meeting_done ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                  ) : (
                    <Circle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--border-strong)' }} />
                  )}
                  <div className="flex-1">
                    <span
                      style={{
                        color: referent.weekly_meeting_done ? 'var(--text-faint)' : 'var(--text)',
                        textDecoration: referent.weekly_meeting_done ? 'line-through' : 'none',
                      }}
                    >
                      {referent.name}
                    </span>
                    {referent.last_meeting_date && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                        Dernière rencontre:{' '}
                        {new Date(referent.last_meeting_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => deleteReferent(referent.id)}
                  className="p-2 transition-all hover:opacity-70"
                  style={{ color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
