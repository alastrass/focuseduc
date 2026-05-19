import { useState, useEffect, useRef } from 'react';
import { Sun, CalendarDays, Send, Trash2, Inbox, Users } from 'lucide-react';
import { supabase, BrainDumpItem } from '../lib/supabase';

type Bucket = 'today' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'team_meeting';

type Props = {
  onShiftChange: (shift: string | null) => void;
  userId: string;
};

const DAY_JS_INDEX: Record<Bucket, number | null> = {
  today: null,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
  team_meeting: 2,
};

const BUCKET_META: Record<Bucket, {
  label: string;
  sub: string;
  icon: typeof Sun;
  color: string;
  soft: string;
  short: string;
}> = {
  today: {
    label: "Aujourd'hui",
    sub: "De minuit à minuit",
    icon: Sun,
    color: '#f59e0b',
    soft: 'rgba(245,158,11,0.12)',
    short: 'Auj.',
  },
  monday: {
    label: 'Lundi',
    sub: 'Prochain lundi',
    icon: CalendarDays,
    color: '#8b5cf6',
    soft: 'rgba(139,92,246,0.12)',
    short: 'Lun',
  },
  tuesday: {
    label: 'Mardi',
    sub: 'Prochain mardi',
    icon: CalendarDays,
    color: '#6366f1',
    soft: 'rgba(99,102,241,0.12)',
    short: 'Mar',
  },
  wednesday: {
    label: 'Mercredi',
    sub: 'Prochain mercredi',
    icon: CalendarDays,
    color: '#0ea5e9',
    soft: 'rgba(14,165,233,0.12)',
    short: 'Mer',
  },
  thursday: {
    label: 'Jeudi',
    sub: 'Prochain jeudi',
    icon: CalendarDays,
    color: '#10b981',
    soft: 'rgba(16,185,129,0.12)',
    short: 'Jeu',
  },
  friday: {
    label: 'Vendredi',
    sub: 'Prochain vendredi',
    icon: CalendarDays,
    color: '#f97316',
    soft: 'rgba(249,115,22,0.12)',
    short: 'Ven',
  },
  saturday: {
    label: 'Samedi',
    sub: 'Prochain samedi',
    icon: CalendarDays,
    color: '#ef4444',
    soft: 'rgba(239,68,68,0.12)',
    short: 'Sam',
  },
  sunday: {
    label: 'Dimanche',
    sub: 'Prochain dimanche',
    icon: CalendarDays,
    color: '#ec4899',
    soft: 'rgba(236,72,153,0.12)',
    short: 'Dim',
  },
  team_meeting: {
    label: "Séance d'équipe",
    sub: 'Chaque mardi — ordre du jour',
    icon: Users,
    color: '#14b8a6',
    soft: 'rgba(20,184,166,0.12)',
    short: 'Équipe',
  },
};

const ALL_BUCKETS: Bucket[] = ['today', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'team_meeting'];
const WEEK_DAYS: Bucket[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function nextWeekdayEnd(dayIndex: number): Date {
  const d = new Date();
  const current = d.getDay();
  let diff = dayIndex - current;
  if (diff <= 0) diff += 7;
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

function bucketExpiry(bucket: Bucket): string {
  if (bucket === 'today') return endOfToday().toISOString();
  const dayIdx = DAY_JS_INDEX[bucket];
  if (dayIdx !== null && dayIdx !== undefined) {
    return nextWeekdayEnd(dayIdx).toISOString();
  }
  return endOfToday().toISOString();
}

function bucketLabel(bucket: string | null): string {
  if (!bucket) return '';
  const meta = BUCKET_META[bucket as Bucket];
  return meta ? meta.label : bucket;
}

type InputsState = Record<Bucket | 'inbox', string>;

export default function Dashboard({ onShiftChange, userId }: Props) {
  const [items, setItems] = useState<BrainDumpItem[]>([]);
  const [inputs, setInputs] = useState<InputsState>({
    today: '', monday: '', tuesday: '', wednesday: '', thursday: '',
    friday: '', saturday: '', sunday: '', team_meeting: '', inbox: '',
  });
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    onShiftChange(null);
  }, [onShiftChange]);

  useEffect(() => {
    if (!userId) return;
    sweepExpired().then(() => loadItems());
  }, [userId]);

  const sweepExpired = async () => {
    const nowIso = new Date().toISOString();
    await supabase
      .from('brain_dump_items')
      .update({ bucket: null, bucket_expires_at: null })
      .eq('user_id', userId)
      .not('bucket', 'is', null)
      .lt('bucket_expires_at', nowIso);
  };

  const loadItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('brain_dump_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setItems(data as BrainDumpItem[]);
    setLoading(false);
  };

  const addNote = async (bucket: Bucket | 'inbox') => {
    const content = inputs[bucket].trim();
    if (!content) return;

    const payload: any = { user_id: userId, content };
    if (bucket !== 'inbox') {
      payload.bucket = bucket;
      payload.bucket_expires_at = bucketExpiry(bucket as Bucket);
    }

    const { data } = await supabase
      .from('brain_dump_items')
      .insert(payload)
      .select()
      .maybeSingle();

    if (data) {
      setItems((prev) => [data as BrainDumpItem, ...prev]);
      setInputs((prev) => ({ ...prev, [bucket]: '' }));
    }
  };

  const deleteItem = async (id: string) => {
    await supabase.from('brain_dump_items').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const moveToBucket = async (id: string, bucket: Bucket | null) => {
    const payload = bucket
      ? { bucket, bucket_expires_at: bucketExpiry(bucket) }
      : { bucket: null, bucket_expires_at: null };
    const { data } = await supabase
      .from('brain_dump_items')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (data) {
      setItems((prev) => prev.map((i) => (i.id === id ? (data as BrainDumpItem) : i)));
    }
  };

  const handleKey = (bucket: Bucket | 'inbox', e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote(bucket);
    }
  };

  const now = Date.now();

  const isActive = (it: BrainDumpItem, bucket: Bucket) =>
    it.bucket === bucket &&
    (!it.bucket_expires_at || new Date(it.bucket_expires_at).getTime() > now);

  const inboxItems = items.filter(
    (i) =>
      (!i.bucket ||
        (i.bucket_expires_at && new Date(i.bucket_expires_at).getTime() <= now)) &&
      !i.project_id &&
      (!i.snoozed_until || new Date(i.snoozed_until) <= new Date())
  );

  const renderTodayCard = () => {
    const meta = BUCKET_META.today;
    const Icon = meta.icon;
    const bucketItems = items.filter((i) => isActive(i, 'today'));

    return (
      <div
        className="card p-5 flex flex-col"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{ background: meta.soft, color: meta.color, borderRadius: 'var(--radius)' }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>{meta.label}</h3>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{meta.sub}</p>
          </div>
          <span
            className="ml-auto text-xs font-bold px-2 py-0.5"
            style={{ background: meta.soft, color: meta.color, borderRadius: '999px' }}
          >
            {bucketItems.length}
          </span>
        </div>

        <div className="relative mt-3">
          <input
            type="text"
            value={inputs.today}
            onChange={(e) => setInputs((prev) => ({ ...prev, today: e.target.value }))}
            onKeyDown={(e) => handleKey('today', e)}
            placeholder="Ajouter une note pour aujourd'hui..."
            style={{
              width: '100%', padding: '10px 46px 10px 14px',
              background: 'var(--input-bg)', color: 'var(--text)',
              border: '1px solid var(--input-border)', borderRadius: 'var(--radius)',
              outline: 'none', fontSize: '14px', boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = meta.color)}
            onBlur={(e) => (e.target.style.borderColor = 'var(--input-border)')}
          />
          <button
            onClick={() => addNote('today')}
            disabled={!inputs.today.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: meta.color, color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 space-y-1.5 flex-1 overflow-y-auto" style={{ maxHeight: '200px' }}>
          {bucketItems.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-faint)' }}>Aucune note</p>
          ) : (
            bucketItems.map((it) => (
              <div
                key={it.id}
                className="group flex items-start gap-2 px-3 py-2 transition-all"
                style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${meta.color}` }}
              >
                <span className="flex-1 text-sm leading-snug break-words" style={{ color: 'var(--text)' }}>{it.content}</span>
                <button
                  onClick={() => moveToBucket(it.id, null)}
                  className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
                  style={{ color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  title="Remettre dans notes rapides"
                >
                  <Inbox className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteItem(it.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
                  style={{ color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderDayCard = (bucket: Bucket) => {
    const meta = BUCKET_META[bucket];
    const Icon = meta.icon;
    const bucketItems = items.filter((i) => isActive(i, bucket));

    return (
      <div
        key={bucket}
        className="card p-4 flex flex-col"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 flex items-center justify-center flex-shrink-0"
            style={{ background: meta.soft, color: meta.color, borderRadius: 'var(--radius-sm)' }}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{meta.label}</h3>
            <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{meta.sub}</p>
          </div>
          <span
            className="text-xs font-bold px-1.5 py-0.5 flex-shrink-0"
            style={{ background: meta.soft, color: meta.color, borderRadius: '999px' }}
          >
            {bucketItems.length}
          </span>
        </div>

        <div className="relative mb-3">
          <input
            type="text"
            value={inputs[bucket]}
            onChange={(e) => setInputs((prev) => ({ ...prev, [bucket]: e.target.value }))}
            onKeyDown={(e) => handleKey(bucket, e)}
            placeholder="Ajouter..."
            style={{
              width: '100%', padding: '8px 40px 8px 12px',
              background: 'var(--input-bg)', color: 'var(--text)',
              border: '1px solid var(--input-border)', borderRadius: 'var(--radius-sm)',
              outline: 'none', fontSize: '13px', boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = meta.color)}
            onBlur={(e) => (e.target.style.borderColor = 'var(--input-border)')}
          />
          <button
            onClick={() => addNote(bucket)}
            disabled={!inputs[bucket].trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: meta.color, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Send className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1.5 flex-1 overflow-y-auto" style={{ maxHeight: '180px' }}>
          {bucketItems.length === 0 ? (
            <p className="text-xs text-center py-3" style={{ color: 'var(--text-faint)' }}>Aucune note</p>
          ) : (
            bucketItems.map((it) => (
              <div
                key={it.id}
                className="group flex items-start gap-1.5 px-2.5 py-1.5 transition-all"
                style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', borderLeft: `2px solid ${meta.color}` }}
              >
                <span className="flex-1 text-xs leading-snug break-words" style={{ color: 'var(--text)' }}>{it.content}</span>
                <button
                  onClick={() => moveToBucket(it.id, null)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 transition-opacity flex-shrink-0"
                  style={{ color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  title="Remettre dans notes rapides"
                >
                  <Inbox className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteItem(it.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 transition-opacity flex-shrink-0"
                  style={{ color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderTeamMeetingCard = () => {
    const meta = BUCKET_META.team_meeting;
    const Icon = meta.icon;
    const bucketItems = items.filter((i) => isActive(i, 'team_meeting'));

    return (
      <div
        className="card p-5 flex flex-col"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${meta.color}44`,
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{ background: meta.soft, color: meta.color, borderRadius: 'var(--radius)' }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>{meta.label}</h3>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{meta.sub}</p>
          </div>
          <span
            className="ml-auto text-xs font-bold px-2 py-0.5"
            style={{ background: meta.soft, color: meta.color, borderRadius: '999px' }}
          >
            {bucketItems.length}
          </span>
        </div>

        <div className="relative mt-3">
          <input
            type="text"
            value={inputs.team_meeting}
            onChange={(e) => setInputs((prev) => ({ ...prev, team_meeting: e.target.value }))}
            onKeyDown={(e) => handleKey('team_meeting', e)}
            placeholder="Point à soulever en séance d'équipe..."
            style={{
              width: '100%', padding: '10px 46px 10px 14px',
              background: 'var(--input-bg)', color: 'var(--text)',
              border: '1px solid var(--input-border)', borderRadius: 'var(--radius)',
              outline: 'none', fontSize: '14px', boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = meta.color)}
            onBlur={(e) => (e.target.style.borderColor = 'var(--input-border)')}
          />
          <button
            onClick={() => addNote('team_meeting')}
            disabled={!inputs.team_meeting.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: meta.color, color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 space-y-1.5 flex-1 overflow-y-auto" style={{ maxHeight: '200px' }}>
          {bucketItems.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-faint)' }}>Aucun point à l'ordre du jour</p>
          ) : (
            bucketItems.map((it) => (
              <div
                key={it.id}
                className="group flex items-start gap-2 px-3 py-2 transition-all"
                style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${meta.color}` }}
              >
                <span className="flex-1 text-sm leading-snug break-words" style={{ color: 'var(--text)' }}>{it.content}</span>
                <button
                  onClick={() => moveToBucket(it.id, null)}
                  className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
                  style={{ color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  title="Remettre dans notes rapides"
                >
                  <Inbox className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteItem(it.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
                  style={{ color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light mb-1" style={{ color: 'var(--text)' }}>
          Notes rapides par période
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Planifie tes notes par jour ou par échéance. Les notes expirées retombent dans « Notes rapides ».
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-sm" style={{ color: 'var(--text-faint)' }}>
          Chargement...
        </div>
      ) : (
        <>
          {renderTodayCard()}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
              Jours de la semaine
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {WEEK_DAYS.map((bucket) => renderDayCard(bucket))}
            </div>
          </div>

          {renderTeamMeetingCard()}

          <div
            className="card p-5"
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--radius)' }}
              >
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                  Notes rapides
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  Inbox général — les notes expirées retombent ici avec leur jour d'origine
                </p>
              </div>
              <span
                className="ml-auto text-xs font-bold px-2 py-0.5"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: '999px' }}
              >
                {inboxItems.length}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={inputs.inbox}
                onChange={(e) => setInputs((prev) => ({ ...prev, inbox: e.target.value }))}
                onKeyDown={(e) => handleKey('inbox', e)}
                placeholder="Vide ton esprit..."
                style={{
                  width: '100%', padding: '10px 46px 10px 14px',
                  background: 'var(--input-bg)', color: 'var(--text)',
                  border: '1px solid var(--input-border)', borderRadius: 'var(--radius)',
                  outline: 'none', fontSize: '14px', boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--input-focus)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--input-border)')}
              />
              <button
                onClick={() => addNote('inbox')}
                disabled={!inputs.inbox.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: 'var(--primary)', color: 'var(--primary-text)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-1.5 max-h-[320px] overflow-y-auto">
              {inboxItems.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-faint)' }}>
                  Aucune note dans l'inbox
                </p>
              ) : (
                inboxItems.map((it) => {
                  const hadBucket = it.bucket !== null && ALL_BUCKETS.includes(it.bucket as Bucket);
                  const dayLabel = hadBucket ? bucketLabel(it.bucket) : null;

                  return (
                    <div
                      key={it.id}
                      className="group flex items-start gap-2 px-3 py-2 transition-all"
                      style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}
                    >
                      <span className="flex-1 text-sm leading-snug break-words" style={{ color: 'var(--text)' }}>
                        {it.content}
                        {dayLabel && (
                          <span
                            className="ml-2 text-[10px] uppercase tracking-wider font-bold"
                            style={{ color: 'var(--text-faint)' }}
                          >
                            prévu · {dayLabel}
                          </span>
                        )}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(['today', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as Bucket[]).map((b) => (
                          <button
                            key={b}
                            onClick={() => moveToBucket(it.id, b)}
                            className="p-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 transition-all hover:scale-105"
                            style={{
                              background: BUCKET_META[b].soft,
                              color: BUCKET_META[b].color,
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                            title={`Déplacer vers ${BUCKET_META[b].label}`}
                          >
                            {BUCKET_META[b].short}
                          </button>
                        ))}
                        <button
                          onClick={() => deleteItem(it.id)}
                          className="p-1 transition-all"
                          style={{ color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
