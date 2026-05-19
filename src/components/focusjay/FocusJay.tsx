import { useState, useEffect } from 'react';
import { CheckSquare, CalendarDays, Users, Zap, Play, LogOut, ArrowLeftRight, Sparkles } from 'lucide-react';
import { supabase, JayTodo, JayWeekPriority, JaySocialPerson, JayDopamineItem, JayCrossItem } from '../../lib/supabase';
import ThemeSelector from '../ThemeSelector';
import CreatorBadge from '../CreatorBadge';
import JayTodos from './JayTodos';
import JayWeekZen from './JayWeekZen';
import JaySocialCircle from './JaySocialCircle';
import JayDopamineMenu from './JayDopamineMenu';
import JayActionTrigger from './JayActionTrigger';
import JayCrossInbox from './JayCrossInbox';

type View = 'todos' | 'week' | 'social' | 'dopamine' | 'action';

const NAV: { id: View; label: string; icon: typeof CheckSquare }[] = [
  { id: 'todos', label: 'Tâches', icon: CheckSquare },
  { id: 'week', label: 'Semaine', icon: CalendarDays },
  { id: 'social', label: 'Cercle', icon: Users },
  { id: 'dopamine', label: 'Dopamine', icon: Zap },
  { id: 'action', label: 'Action', icon: Play },
];

type Props = {
  userId: string;
  onLeave: () => void;
  onSignOut: () => void;
};

export default function FocusJay({ userId, onLeave, onSignOut }: Props) {
  const [view, setView] = useState<View>('todos');
  const [todos, setTodos] = useState<JayTodo[]>([]);
  const [priorities, setPriorities] = useState<JayWeekPriority[]>([]);
  const [people, setPeople] = useState<JaySocialPerson[]>([]);
  const [dopamine, setDopamine] = useState<JayDopamineItem[]>([]);
  const [crossItems, setCrossItems] = useState<JayCrossItem[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [t, p, s, d, c] = await Promise.all([
      supabase.from('jay_todos').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('jay_week_priorities').select('*').eq('user_id', userId),
      supabase.from('jay_social_circle').select('*').eq('user_id', userId),
      supabase.from('jay_dopamine_menu').select('*').eq('user_id', userId),
      supabase.from('jay_cross_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);
    if (t.data) setTodos(t.data as JayTodo[]);
    if (p.data) setPriorities(p.data as JayWeekPriority[]);
    if (s.data) setPeople(s.data as JaySocialPerson[]);
    if (d.data) setDopamine(d.data as JayDopamineItem[]);
    if (c.data) setCrossItems(c.data as JayCrossItem[]);
  };

  const pendingCross = crossItems.filter((i) => i.direction === 'to_jay' && !i.done).length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient, var(--bg))' }}>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <Sparkles className="w-5 h-5" style={{ color: 'var(--primary-text)' }} />
              </div>
              <div>
                <h1 className="text-2xl font-light" style={{ color: 'var(--text)' }}>FocusJay</h1>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Espace vie privée</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSelector space="jay" />
              <button
                onClick={onLeave}
                className="flex items-center gap-1.5 px-3 py-2 text-xs transition-all hover:opacity-70"
                style={{
                  color: 'var(--text-muted)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow)',
                }}
                title="Changer d'espace"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Changer
              </button>
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-3 py-2 text-xs transition-all hover:opacity-70"
                style={{
                  color: 'var(--text-muted)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <nav className="flex gap-1.5 flex-wrap">
            {NAV.map((item) => {
              const isBadge = item.id === 'todos' && pendingCross > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all"
                  style={
                    view === item.id
                      ? {
                          background: 'var(--nav-active-bg)',
                          color: 'var(--nav-active-text)',
                          borderRadius: 'var(--radius)',
                          boxShadow: 'var(--shadow-lg)',
                          border: '1px solid var(--border)',
                        }
                      : {
                          background: 'transparent',
                          color: 'var(--nav-inactive)',
                          borderRadius: 'var(--radius)',
                          border: '1px solid transparent',
                        }
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {isBadge && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
                    >
                      {pendingCross}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        <main>
          <JayCrossInbox items={crossItems} onUpdate={loadAll} />
          {view === 'todos' && <JayTodos items={todos} userId={userId} onUpdate={loadAll} />}
          {view === 'week' && <JayWeekZen priorities={priorities} userId={userId} onUpdate={loadAll} />}
          {view === 'social' && <JaySocialCircle people={people} userId={userId} onUpdate={loadAll} />}
          {view === 'dopamine' && <JayDopamineMenu items={dopamine} userId={userId} onUpdate={loadAll} />}
          {view === 'action' && <JayActionTrigger />}
        </main>

        <CreatorBadge />
      </div>
    </div>
  );
}
