import { FolderInput, Trash2, EyeOff, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { supabase, BrainDumpItem, IdeaProject } from '../../lib/supabase';

type Props = {
  staleItems: BrainDumpItem[];
  projects: IdeaProject[];
  userId: string;
  onUpdate: () => void;
  onClose: () => void;
};

export default function QuickSortMode({ staleItems, projects, userId, onUpdate, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [done, setDone] = useState(false);

  const current = staleItems[currentIndex];

  const advance = () => {
    if (currentIndex + 1 >= staleItems.length) {
      setDone(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const deleteItem = async () => {
    await supabase.from('brain_dump_items').delete().eq('id', current.id);
    onUpdate();
    advance();
  };

  const snooze = async () => {
    const snoozeUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('brain_dump_items').update({ snoozed_until: snoozeUntil }).eq('id', current.id);
    onUpdate();
    advance();
  };

  const moveToProject = async (projectId: string) => {
    await supabase.from('project_tasks').insert({
      project_id: projectId,
      title: current.content,
      note: current.note || '',
      deadline: current.deadline,
      user_id: userId,
      source_dump_id: current.id,
    });
    await supabase.from('brain_dump_items').delete().eq('id', current.id);
    onUpdate();
    advance();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-orange-50 border-b border-orange-100">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h3 className="font-medium text-orange-800">Mode Tri Rapide</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-orange-500">
              {done ? staleItems.length : currentIndex + 1} / {staleItems.length}
            </span>
            <button onClick={onClose} className="text-orange-400 hover:text-orange-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {done ? (
          <div className="px-5 py-12 text-center">
            <div className="text-4xl mb-3">✓</div>
            <p className="text-slate-600 font-medium">Tri terminé !</p>
            <p className="text-slate-400 text-sm mt-1">
              Toutes les idées anciennes ont été traitées.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="px-5 py-6">
            <div className="bg-amber-50 border-2 border-orange-300 rounded-xl p-4 mb-6">
              <p className="text-slate-700 text-base leading-relaxed">{current?.content}</p>
              {current?.note && (
                <p className="text-slate-500 text-sm mt-2 italic">{current.note}</p>
              )}
              <p className="text-xs text-orange-400 mt-3">
                Créé le {new Date(current?.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>

            <div className="space-y-3">
              {projects.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Déplacer vers un projet</p>
                  <div className="flex flex-wrap gap-2">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => moveToProject(p.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm border border-emerald-200"
                      >
                        <FolderInput className="w-4 h-4" />
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={snooze}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  <EyeOff className="w-4 h-4" />
                  Snooze 3j
                </button>
                <button
                  onClick={deleteItem}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
