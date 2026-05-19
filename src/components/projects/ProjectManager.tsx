import { useState } from 'react';
import { Plus, CheckSquare, Square, Trash2, FolderOpen, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
import { supabase, IdeaProject, ProjectTask, BrainDumpItem } from '../../lib/supabase';

const PROJECT_COLORS: { key: string; bg: string; border: string; badge: string }[] = [
  { key: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-300', badge: 'bg-emerald-500' },
  { key: 'blue', bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-500' },
  { key: 'teal', bg: 'bg-teal-50', border: 'border-teal-300', badge: 'bg-teal-500' },
  { key: 'sky', bg: 'bg-sky-50', border: 'border-sky-300', badge: 'bg-sky-500' },
];

function getColorConfig(key: string) {
  return PROJECT_COLORS.find((c) => c.key === key) || PROJECT_COLORS[0];
}

type Props = {
  projects: IdeaProject[];
  tasks: ProjectTask[];
  userId: string;
  draggedItem: BrainDumpItem | null;
  onUpdate: () => void;
};

export default function ProjectManager({ projects, tasks, userId, draggedItem, onUpdate }: Props) {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('emerald');
  const [showNewProject, setShowNewProject] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    await supabase.from('idea_projects').insert({
      name: newProjectName.trim(),
      color: newProjectColor,
      user_id: userId,
    });

    setNewProjectName('');
    setShowNewProject(false);
    onUpdate();
  };

  const deleteProject = async (id: string) => {
    await supabase.from('project_tasks').delete().eq('project_id', id);
    await supabase.from('idea_projects').delete().eq('id', id);
    onUpdate();
  };

  const addTask = async (projectId: string) => {
    const title = newTaskInputs[projectId]?.trim();
    if (!title) return;

    await supabase.from('project_tasks').insert({
      project_id: projectId,
      title,
      user_id: userId,
    });

    setNewTaskInputs({ ...newTaskInputs, [projectId]: '' });
    onUpdate();
  };

  const toggleTask = async (task: ProjectTask) => {
    await supabase
      .from('project_tasks')
      .update({
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null,
      })
      .eq('id', task.id);
    onUpdate();
  };

  const deleteTask = async (id: string) => {
    await supabase.from('project_tasks').delete().eq('id', id);
    onUpdate();
  };

  const handleDrop = async (e: React.DragEvent, projectId: string) => {
    e.preventDefault();
    setDropTarget(null);
    if (!draggedItem) return;

    await supabase.from('project_tasks').insert({
      project_id: projectId,
      title: draggedItem.content,
      note: draggedItem.note || '',
      deadline: draggedItem.deadline,
      user_id: userId,
      source_dump_id: draggedItem.id,
    });

    await supabase.from('brain_dump_items').delete().eq('id', draggedItem.id);
    onUpdate();
  };

  const getProjectTasks = (projectId: string) =>
    tasks.filter((t) => t.project_id === projectId);

  const getProgress = (projectId: string) => {
    const pt = getProjectTasks(projectId);
    if (pt.length === 0) return 0;
    return Math.round((pt.filter((t) => t.completed).length / pt.length) * 100);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-slate-700">Projets</h3>
        <button
          onClick={() => setShowNewProject(!showNewProject)}
          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau projet
        </button>
      </div>

      {showNewProject && (
        <form onSubmit={createProject} className="bg-white rounded-xl border border-slate-200 p-4">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Nom du projet..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 mb-3"
            autoFocus
          />
          <div className="flex items-center gap-2 mb-3">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setNewProjectColor(c.key)}
                className={`w-6 h-6 rounded-full ${c.badge} transition-all ${
                  newProjectColor === c.key ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={() => setShowNewProject(false)}
              className="px-4 py-2 text-slate-500 text-sm hover:text-slate-700"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 && !showNewProject && (
        <div className="text-center py-10 text-slate-300">
          <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun projet créé</p>
          <p className="text-xs mt-1">Crée un projet et glisses-y des idées du vrac</p>
        </div>
      )}

      <div className="space-y-3 overflow-y-auto">
        {projects.map((project) => {
          const color = getColorConfig(project.color);
          const progress = getProgress(project.id);
          const pt = getProjectTasks(project.id);
          const isCollapsed = collapsed[project.id];
          const isDragOver = dropTarget === project.id;

          return (
            <div
              key={project.id}
              className={`rounded-xl border-2 transition-all ${color.bg} ${
                isDragOver ? `${color.border} shadow-lg scale-[1.01]` : 'border-transparent'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget(project.id);
              }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={(e) => handleDrop(e, project.id)}
            >
              <div className="px-4 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color.badge} flex-shrink-0`} />
                  <span className="font-medium text-slate-700 flex-1 text-sm">{project.name}</span>
                  <span className="text-xs text-slate-400">{pt.length} tâche{pt.length !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setCollapsed({ ...collapsed, [project.id]: !isCollapsed })}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-white rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color.badge} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{progress}%</span>
                </div>

                {isDragOver && (
                  <p className="text-xs text-center text-slate-500 mt-2 py-1 border border-dashed border-slate-300 rounded-lg">
                    Déposer ici
                  </p>
                )}
              </div>

              {!isCollapsed && (
                <div className="px-4 pb-3">
                  <div className="space-y-1 mb-2">
                    {pt.map((task) => (
                      <div key={task.id} className="flex items-start gap-2 group">
                        <button
                          onClick={() => toggleTask(task)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {task.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.deadline && (
                            <span className="flex items-center gap-1 text-xs text-blue-400 mt-0.5">
                              <CalendarDays className="w-3 h-3" />
                              {new Date(task.deadline).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newTaskInputs[project.id] || ''}
                      onChange={(e) =>
                        setNewTaskInputs({ ...newTaskInputs, [project.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addTask(project.id);
                      }}
                      placeholder="Ajouter une tâche..."
                      className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                    <button
                      onClick={() => addTask(project.id)}
                      className={`px-3 py-1.5 text-white text-sm rounded-lg transition-colors ${color.badge} hover:opacity-90`}
                    >
                      <Plus className="w-4 h-4" />
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
