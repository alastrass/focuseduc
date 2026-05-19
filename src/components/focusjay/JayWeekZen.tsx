import { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { supabase, JayWeekPriority } from '../../lib/supabase';

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

type Props = {
  priorities: JayWeekPriority[];
  userId: string;
  onUpdate: () => void;
};

export default function JayWeekZen({ priorities, userId, onUpdate }: Props) {
  const weekDates = getWeekDates();
  const today = new Date().toISOString().split('T')[0];
  const [activeDay, setActiveDay] = useState<string>(
    today >= weekDates[0] && today <= weekDates[6] ? today : weekDates[0]
  );
  const [newContent, setNewContent] = useState('');

  const dayPriorities = priorities.filter((p) => p.day_date === activeDay).sort((a, b) => a.slot - b.slot);
  const nextSlot = dayPriorities.length < 3 ? dayPriorities.length + 1 : null;

  const addPriority = async () => {
    if (!newContent.trim() || !nextSlot) return;
    await supabase.from('jay_week_priorities').insert({
      user_id: userId,
      day_date: activeDay,
      slot: nextSlot,
      content: newContent.trim(),
    });
    setNewContent('');
    onUpdate();
  };

  const toggleDone = async (p: JayWeekPriority) => {
    await supabase.from('jay_week_priorities').update({ done: !p.done }).eq('id', p.id);
    onUpdate();
  };

  const deletePriority = async (id: string) => {
    await supabase.from('jay_week_priorities').delete().eq('id', id);
    onUpdate();
  };

  const dayIndex = weekDates.indexOf(activeDay);
  const fullDayName = DAYS_FULL[dayIndex] ?? '';
  const activeDate = new Date(activeDay + 'T12:00:00');
  const formattedDate = activeDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-7 gap-1.5">
        {weekDates.map((date, i) => {
          const isToday = date === today;
          const isActive = date === activeDay;
          const dayPrios = priorities.filter((p) => p.day_date === date);

          return (
            <button
              key={date}
              onClick={() => setActiveDay(date)}
              className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: isActive ? 'var(--primary)' : isToday ? 'var(--primary-soft)' : 'var(--surface)',
                border: isToday && !isActive ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                boxShadow: isActive ? 'var(--shadow-lg)' : 'none',
              }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: isActive ? 'var(--primary-text)' : isToday ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                {DAYS_FR[i]}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: isActive ? 'var(--primary-text)' : 'var(--text)' }}
              >
                {new Date(date + 'T12:00:00').getDate()}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3].map((slot) => {
                  const p = dayPrios.find((pr) => pr.slot === slot);
                  return (
                    <span
                      key={slot}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: p?.done
                          ? isActive ? 'rgba(255,255,255,0.6)' : 'var(--primary)'
                          : p
                          ? isActive ? 'rgba(255,255,255,0.35)' : 'var(--border-strong)'
                          : isActive ? 'rgba(255,255,255,0.15)' : 'var(--border)',
                      }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="p-5 rounded-3xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{fullDayName}</h3>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{formattedDate}</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
            {dayPriorities.filter((p) => p.done).length} / {dayPriorities.length} faites
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {dayPriorities.length === 0 && (
            <p className="text-center py-4 text-sm" style={{ color: 'var(--text-faint)' }}>
              Pas encore de priorité pour ce jour
            </p>
          )}
          {dayPriorities.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-2xl transition-all"
              style={{ background: p.done ? 'var(--surface-2)' : 'var(--primary-soft)', opacity: p.done ? 0.65 : 1 }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
              >
                {idx + 1}
              </span>
              <p
                className="flex-1 text-sm"
                style={{
                  color: p.done ? 'var(--text-faint)' : 'var(--text)',
                  textDecoration: p.done ? 'line-through' : 'none',
                }}
              >
                {p.content}
              </p>
              <button
                onClick={() => toggleDone(p)}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
                style={{ borderColor: p.done ? 'var(--border)' : 'var(--primary)', background: p.done ? 'var(--primary)' : 'transparent' }}
              >
                {p.done && <Check className="w-3 h-3" style={{ color: 'var(--primary-text)' }} />}
              </button>
              <button
                onClick={() => deletePriority(p.id)}
                className="opacity-25 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {nextSlot ? (
          <div
            className="flex gap-2 p-3 rounded-2xl"
            style={{ background: 'var(--surface-2)', border: '1.5px dashed var(--border)' }}
          >
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPriority()}
              placeholder={`Priorité ${nextSlot} du jour...`}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text)' }}
            />
            <button
              onClick={addPriority}
              className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-center text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
            3 priorités atteintes — focus sur ces 3 objectifs !
          </p>
        )}
      </div>
    </div>
  );
}
