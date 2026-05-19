import { useState } from 'react';
import { Plus, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, JayTodo } from '../../lib/supabase';

const CATEGORIES = ['Famille', 'Amis', 'Loisirs', 'Maison'] as const;

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Famille: { bg: '#fdf2f8', text: '#be185d', border: '#f9a8d4' },
  Amis:    { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
  Loisirs: { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
  Maison:  { bg: '#eff6ff', text: '#1d4ed8', border: '#93c5fd' },
};

type Props = {
  items: JayTodo[];
  userId: string;
  onUpdate: () => void;
};

export default function JayTodos({ items, userId, onUpdate }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('Famille');
  const [newTitle, setNewTitle] = useState('');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const filtered = items.filter((t) => t.category === activeCategory);

  const addTodo = async () => {
    if (!newTitle.trim()) return;
    await supabase.from('jay_todos').insert({
      user_id: userId,
      title: newTitle.trim(),
      category: activeCategory,
    });
    setNewTitle('');
    onUpdate();
  };

  const toggleDone = async (item: JayTodo) => {
    await supabase
      .from('jay_todos')
      .update({ done: !item.done, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    onUpdate();
  };

  const deleteTodo = async (id: string) => {
    await supabase.from('jay_todos').delete().eq('id', id);
    onUpdate();
  };

  const colors = CATEGORY_COLORS[activeCategory];

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const c = CATEGORY_COLORS[cat];
          const count = items.filter((t) => t.category === cat && !t.done).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2"
              style={
                activeCategory === cat
                  ? { background: c.bg, color: c.text, border: `1.5px solid ${c.border}`, boxShadow: `0 2px 8px ${c.border}80` }
                  : { background: 'var(--surface)', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }
              }
            >
              {cat}
              {count > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{
                    background: activeCategory === cat ? c.border : 'var(--border)',
                    color: activeCategory === cat ? c.text : 'var(--text-faint)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        className="flex gap-2 p-3 rounded-2xl"
        style={{ background: colors.bg, border: `1.5px solid ${colors.border}` }}
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder={`Ajouter dans ${activeCategory}...`}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: colors.text }}
        />
        <button
          onClick={addTodo}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80 active:scale-95"
          style={{ background: colors.border }}
        >
          <Plus className="w-4 h-4" style={{ color: colors.text }} />
        </button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-10" style={{ color: 'var(--text-faint)' }}>
            <p className="text-sm">Rien dans {activeCategory} pour l'instant</p>
          </div>
        )}
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-2xl transition-all"
            style={{
              background: item.done ? 'var(--surface-2)' : 'var(--surface)',
              border: `1px solid ${item.done ? 'var(--border)' : colors.border}`,
              opacity: item.done ? 0.6 : 1,
            }}
          >
            <button
              onClick={() => toggleDone(item)}
              className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                borderColor: item.done ? 'var(--border)' : colors.border,
                background: item.done ? colors.bg : 'transparent',
              }}
            >
              {item.done && <Check className="w-3 h-3" style={{ color: colors.text }} />}
            </button>

            <div className="flex-1 min-w-0">
              <p
                className="text-sm"
                style={{
                  color: item.done ? 'var(--text-faint)' : 'var(--text)',
                  textDecoration: item.done ? 'line-through' : 'none',
                }}
              >
                {item.title}
              </p>
              {item.note && (
                <button
                  onClick={() => setExpandedNote(expandedNote === item.id ? null : item.id)}
                  className="flex items-center gap-1 mt-1 text-xs"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {expandedNote === item.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Note
                </button>
              )}
              {expandedNote === item.id && item.note && (
                <p className="mt-1.5 text-xs italic" style={{ color: 'var(--text-muted)' }}>
                  {item.note}
                </p>
              )}
            </div>

            <button
              onClick={() => deleteTodo(item.id)}
              className="p-1 rounded-lg opacity-30 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
