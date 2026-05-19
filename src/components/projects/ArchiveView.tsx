import { RotateCcw, FolderInput, X, Archive } from 'lucide-react';
import { useState } from 'react';
import { supabase, BrainDumpItem, IdeaProject } from '../../lib/supabase';

type Props = {
  archivedItems: BrainDumpItem[];
  projects: IdeaProject[];
  userId: string;
  onUpdate: () => void;
  onClose: () => void;
};

export default function ArchiveView({ archivedItems, projects, userId, onUpdate, onClose }: Props) {
  const [moveMenuOpen, setMoveMenuOpen] = useState<string | null>(null);

  const reactivate = async (id: string) => {
    await supabase
      .from('brain_dump_items')
      .update({
        archived: false,
        archived_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    onUpdate();
  };

  const moveToProject = async (item: BrainDumpItem, projectId: string) => {
    await supabase.from('project_tasks').insert({
      project_id: projectId,
      title: item.content,
      note: item.note || '',
      deadline: item.deadline,
      user_id: userId,
      source_dump_id: item.id,
    });
    await supabase.from('brain_dump_items').delete().eq('id', item.id);
    setMoveMenuOpen(null);
    onUpdate();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('brain_dump_items').delete().eq('id', id);
    onUpdate();
  };

  const byDate = [...archivedItems].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-slate-400" />
          <h3 className="font-medium text-slate-600">Archives du Vrac</h3>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            {archivedItems.length}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {byDate.length === 0 ? (
        <div className="text-center py-10 text-slate-300">
          <Archive className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune idée archivée</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
          {byDate.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-500 truncate">{item.content}</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {new Date(item.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => reactivate(item.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                  title="Remettre dans le vrac"
                >
                  <RotateCcw className="w-3 h-3" />
                  Réactiver
                </button>

                {projects.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setMoveMenuOpen(moveMenuOpen === item.id ? null : item.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Déplacer vers un projet"
                    >
                      <FolderInput className="w-4 h-4" />
                    </button>
                    {moveMenuOpen === item.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 z-20 min-w-[160px] overflow-hidden">
                        {projects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => moveToProject(item, p.id)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  title="Supprimer définitivement"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
