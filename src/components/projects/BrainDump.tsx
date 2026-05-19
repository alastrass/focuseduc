import { useState, useRef } from 'react';
import { Clock, CalendarDays, StickyNote, Trash2, ChevronDown, ChevronUp, EyeOff, FolderInput, X, Send } from 'lucide-react';
import { supabase, BrainDumpItem, IdeaProject } from '../../lib/supabase';

type Props = {
  items: BrainDumpItem[];
  projects: IdeaProject[];
  userId: string;
  onUpdate: () => void;
  onDragStart: (item: BrainDumpItem) => void;
  onSendToJay?: (content: string, sourceId: string) => void;
};

function getAgingStatus(item: BrainDumpItem): 'fresh' | 'aging' | 'stale' {
  const now = Date.now();
  const created = new Date(item.created_at).getTime();
  const hours = (now - created) / (1000 * 60 * 60);
  if (hours > 48) return 'stale';
  if (hours > 24) return 'aging';
  return 'fresh';
}

type EditState = {
  id: string;
  note: string;
  deadline: string;
};

export default function BrainDump({ items, projects, userId, onUpdate, onDragStart, onSendToJay }: Props) {
  const [newContent, setNewContent] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [moveMenuOpen, setMoveMenuOpen] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newContent.trim()) {
      await supabase.from('brain_dump_items').insert({
        content: newContent.trim(),
        user_id: userId,
      });
      setNewContent('');
      onUpdate();
    }
  };

  const deleteItem = async (id: string) => {
    await supabase.from('brain_dump_items').delete().eq('id', id);
    onUpdate();
  };

  const snoozeItem = async (id: string) => {
    const snoozeUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('brain_dump_items').update({ snoozed_until: snoozeUntil }).eq('id', id);
    onUpdate();
  };

  const moveToProject = async (item: BrainDumpItem, projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

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

  const saveEdit = async () => {
    if (!editState) return;
    await supabase
      .from('brain_dump_items')
      .update({
        note: editState.note,
        deadline: editState.deadline || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editState.id);
    setEditState(null);
    setExpanded(null);
    onUpdate();
  };

  const openEdit = (item: BrainDumpItem) => {
    if (expanded === item.id) {
      setExpanded(null);
      setEditState(null);
    } else {
      setExpanded(item.id);
      setEditState({
        id: item.id,
        note: item.note || '',
        deadline: item.deadline ? item.deadline.slice(0, 10) : '',
      });
    }
  };

  const activeSnoozed = items.filter(
    (item) => item.snoozed_until && new Date(item.snoozed_until) > new Date()
  );
  const visible = items.filter(
    (item) => !item.snoozed_until || new Date(item.snoozed_until) <= new Date()
  );

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <input
          ref={inputRef}
          type="text"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tape une idée, appuie sur Entrée..."
          className="w-full px-4 py-3 bg-amber-50 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400 text-slate-700 placeholder-amber-400 text-base"
          autoFocus
        />
        <p className="text-xs text-amber-500 mt-1 ml-1">Appuie sur Entrée pour capturer</p>
      </div>

      {activeSnoozed.length > 0 && (
        <p className="text-xs text-slate-400 mb-3">
          {activeSnoozed.length} idée{activeSnoozed.length > 1 ? 's' : ''} masquée{activeSnoozed.length > 1 ? 's' : ''} (snooze actif)
        </p>
      )}

      <div className="space-y-2 overflow-y-auto flex-1">
        {visible.length === 0 && (
          <div className="text-center py-10 text-amber-300">
            <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucune idée en vrac pour le moment</p>
          </div>
        )}

        {visible.map((item) => {
          const aging = getAgingStatus(item);
          const isExpanded = expanded === item.id;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => onDragStart(item)}
              className={`bg-amber-50 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing select-none ${
                aging === 'stale'
                  ? 'border-orange-300'
                  : aging === 'aging'
                  ? 'border-amber-300'
                  : 'border-amber-200'
              }`}
            >
              <div className="flex items-start gap-2 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-700 text-sm leading-relaxed break-words">{item.content}</span>
                    {aging === 'stale' && (
                      <span title="Cette idée est là depuis plus de 48h">
                        <Clock className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      </span>
                    )}
                    {item.deadline && (
                      <span className="flex items-center gap-1 text-xs text-blue-500">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(item.deadline).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    {item.note && (
                      <span className="text-xs text-slate-400 italic truncate max-w-[140px]">{item.note}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1 text-amber-400 hover:text-amber-600 transition-colors"
                    title="Édition rapide"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {projects.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setMoveMenuOpen(moveMenuOpen === item.id ? null : item.id)}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Déplacer vers un projet"
                      >
                        <FolderInput className="w-4 h-4" />
                      </button>
                      {moveMenuOpen === item.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 z-20 min-w-[180px] overflow-hidden">
                          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                            <span className="text-xs font-medium text-slate-500">Déplacer vers</span>
                            <button onClick={() => setMoveMenuOpen(null)}>
                              <X className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
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

                  {onSendToJay && (
                    <button
                      onClick={() => onSendToJay(item.content, item.id)}
                      className="p-1 transition-colors hover:opacity-80"
                      style={{ color: '#f472b6' }}
                      title="Envoyer vers FocusJay"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => snoozeItem(item.id)}
                    className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
                    title="Snooze 3 jours"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isExpanded && editState?.id === item.id && (
                <div className="px-3 pb-3 border-t border-amber-200 pt-2">
                  <textarea
                    value={editState.note}
                    onChange={(e) => setEditState({ ...editState, note: e.target.value })}
                    placeholder="Ajouter une note..."
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 resize-none mb-2"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={editState.deadline}
                      onChange={(e) => setEditState({ ...editState, deadline: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-sm bg-white border border-amber-200 rounded-lg focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={saveEdit}
                      className="px-4 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
