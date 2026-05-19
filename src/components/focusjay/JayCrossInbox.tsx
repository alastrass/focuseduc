import { Check, Trash2, ArrowLeftRight } from 'lucide-react';
import { supabase, JayCrossItem } from '../../lib/supabase';

type Props = {
  items: JayCrossItem[];
  onUpdate: () => void;
};

export default function JayCrossInbox({ items, onUpdate }: Props) {
  const incoming = items.filter((i) => i.direction === 'to_jay' && !i.done);

  const markDone = async (id: string) => {
    await supabase.from('jay_cross_items').update({ done: true }).eq('id', id);
    onUpdate();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('jay_cross_items').delete().eq('id', id);
    onUpdate();
  };

  if (incoming.length === 0) return null;

  return (
    <div
      className="mb-4 p-4 rounded-2xl"
      style={{ background: 'var(--primary-soft)', border: '1.5px solid var(--primary)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <ArrowLeftRight className="w-4 h-4" style={{ color: 'var(--primary)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
          {incoming.length} idée{incoming.length > 1 ? 's' : ''} venue{incoming.length > 1 ? 's' : ''} de FocusEduc
        </span>
      </div>
      <div className="space-y-2">
        {incoming.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'var(--surface)' }}
          >
            <p className="flex-1 text-sm" style={{ color: 'var(--text)' }}>{item.content}</p>
            <button
              onClick={() => markDone(item.id)}
              className="p-1.5 rounded-lg transition-all hover:scale-110"
              style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}
              title="Marquer comme traité"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteItem(item.id)}
              className="p-1.5 rounded-lg opacity-30 hover:opacity-80 transition-opacity"
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
