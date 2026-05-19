import { useState } from 'react';
import { Plus, Shuffle, Trash2, Zap } from 'lucide-react';
import { supabase, JayDopamineItem } from '../../lib/supabase';

const CATEGORIES = [
  { id: 'movement', label: 'Mouvement', emoji: '🏃', color: '#10b981' },
  { id: 'creativity', label: 'Créativité', emoji: '🎨', color: '#f59e0b' },
  { id: 'social', label: 'Social', emoji: '💬', color: '#3b82f6' },
  { id: 'calm', label: 'Calme', emoji: '🌿', color: '#6366f1' },
  { id: 'other', label: 'Autre', emoji: '✨', color: '#ec4899' },
] as const;

type Props = {
  items: JayDopamineItem[];
  userId: string;
  onUpdate: () => void;
};

export default function JayDopamineMenu({ items, userId, onUpdate }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<string>('movement');
  const [suggestion, setSuggestion] = useState<JayDopamineItem | null>(null);
  const [energyLow, setEnergyLow] = useState(false);
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const filtered = filterCat ? items.filter((i) => i.category === filterCat) : items;

  const addItem = async () => {
    if (!newTitle.trim()) return;
    await supabase.from('jay_dopamine_menu').insert({
      user_id: userId,
      title: newTitle.trim(),
      category: newCategory,
    });
    setNewTitle('');
    onUpdate();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('jay_dopamine_menu').delete().eq('id', id);
    if (suggestion?.id === id) setSuggestion(null);
    onUpdate();
  };

  const suggestRandom = () => {
    setEnergyLow(true);
    if (items.length === 0) return;
    setSuggestion(items[Math.floor(Math.random() * items.length)]);
  };

  const getCat = (id: string) => CATEGORIES.find((c) => c.id === id);

  return (
    <div className="space-y-5">
      {!energyLow ? (
        <button
          onClick={suggestRandom}
          className="w-full py-5 rounded-3xl flex flex-col items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            boxShadow: 'var(--shadow-lg)',
            color: 'var(--primary-text)',
          }}
        >
          <Zap className="w-7 h-7" />
          <span className="font-semibold text-lg">Énergie basse ?</span>
          <span className="text-sm opacity-75">Appuie pour une activité qui te fait du bien</span>
        </button>
      ) : (
        <div
          className="p-6 rounded-3xl text-center space-y-3"
          style={{
            background: 'linear-gradient(135deg, var(--primary-soft) 0%, var(--surface) 100%)',
            border: '2px solid var(--primary)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {suggestion ? (
            <>
              <p className="text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--text-faint)' }}>
                Et si tu essayais...
              </p>
              <div className="text-3xl py-1">{getCat(suggestion.category)?.emoji}</div>
              <p className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{suggestion.title}</p>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: `${getCat(suggestion.category)?.color}20`, color: getCat(suggestion.category)?.color }}
              >
                {getCat(suggestion.category)?.label}
              </span>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Ajoute d'abord des activités à ton menu !
            </p>
          )}
          <div className="flex gap-2 justify-center mt-2">
            <button
              onClick={suggestRandom}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
            >
              <Shuffle className="w-4 h-4" />
              Autre idée
            </button>
            <button
              onClick={() => { setEnergyLow(false); setSuggestion(null); }}
              className="px-4 py-2 rounded-xl text-sm transition-all hover:opacity-70"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <div
        className="p-4 rounded-2xl space-y-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          Ajouter une activité
        </p>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Ex: Marcher 10 minutes, Dessiner, Appeler un ami..."
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setNewCategory(cat.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={
                newCategory === cat.id
                  ? { background: `${cat.color}20`, color: cat.color, border: `1.5px solid ${cat.color}` }
                  : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }
              }
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
        <button
          onClick={addItem}
          className="w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:opacity-80"
          style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
        >
          <Plus className="w-4 h-4" />
          Ajouter au menu
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCat(null)}
          className="px-3 py-1 rounded-full text-xs transition-all"
          style={
            filterCat === null
              ? { background: 'var(--primary)', color: 'var(--primary-text)' }
              : { background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
          }
        >
          Tout ({items.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.category === cat.id).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className="px-3 py-1 rounded-full text-xs transition-all"
              style={
                filterCat === cat.id
                  ? { background: `${cat.color}25`, color: cat.color, border: `1px solid ${cat.color}` }
                  : { background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {cat.emoji} {count}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center py-6 text-sm" style={{ color: 'var(--text-faint)' }}>
            Aucune activité dans cette catégorie
          </p>
        )}
        {filtered.map((item) => {
          const cat = getCat(item.category);
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <span className="text-lg">{cat?.emoji}</span>
              <span className="flex-1 text-sm" style={{ color: 'var(--text)' }}>{item.title}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${cat?.color}15`, color: cat?.color }}
              >
                {cat?.label}
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                className="opacity-25 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
