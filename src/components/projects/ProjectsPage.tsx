import { useState, useEffect, useCallback } from 'react';
import { Archive, Zap } from 'lucide-react';
import { supabase, BrainDumpItem, IdeaProject, ProjectTask } from '../../lib/supabase';
import BrainDump from './BrainDump';
import ProjectManager from './ProjectManager';
import ArchiveView from './ArchiveView';
import QuickSortMode from './QuickSortMode';

const ARCHIVE_AFTER_DAYS = 7;
const STALE_AFTER_HOURS = 48;
const WEEKLY_NOTIFICATION_KEY = 'focuseduc_last_weekly_notif';

function getArchivedThisWeek(items: BrainDumpItem[]): number {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return items.filter(
    (i) => i.archived && i.archived_at && new Date(i.archived_at) > weekAgo
  ).length;
}

export default function ProjectsPage() {
  const [dumpItems, setDumpItems] = useState<BrainDumpItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<BrainDumpItem[]>([]);
  const [projects, setProjects] = useState<IdeaProject[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<BrainDumpItem | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [showQuickSort, setShowQuickSort] = useState(false);
  const [showWeeklyNotif, setShowWeeklyNotif] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadAll();
    }
  }, [userId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
    setLoading(false);
  };

  const autoArchiveStaleItems = useCallback(async (uid: string, items: BrainDumpItem[]) => {
    const threshold = new Date(Date.now() - ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000);
    const toArchive = items.filter(
      (item) =>
        !item.archived &&
        !item.project_id &&
        new Date(item.created_at) < threshold
    );

    if (toArchive.length > 0) {
      await supabase
        .from('brain_dump_items')
        .update({ archived: true, archived_at: new Date().toISOString() })
        .in('id', toArchive.map((i) => i.id));
    }
  }, []);

  const checkWeeklyNotification = useCallback((archived: BrainDumpItem[]) => {
    const last = localStorage.getItem(WEEKLY_NOTIFICATION_KEY);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (!last || parseInt(last) < weekAgo) {
      const count = getArchivedThisWeek(archived);
      if (count > 0) {
        setShowWeeklyNotif(true);
        localStorage.setItem(WEEKLY_NOTIFICATION_KEY, String(Date.now()));
      }
    }
  }, []);

  const loadAll = useCallback(async () => {
    if (!userId) return;

    const [dumpRes, projectsRes, tasksRes] = await Promise.all([
      supabase
        .from('brain_dump_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('idea_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at'),
      supabase
        .from('project_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at'),
    ]);

    const allDump: BrainDumpItem[] = dumpRes.data || [];
    await autoArchiveStaleItems(userId, allDump);

    const refreshedRes = await supabase
      .from('brain_dump_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const refreshed: BrainDumpItem[] = refreshedRes.data || [];
    const active = refreshed.filter((i) => !i.archived);
    const archived = refreshed.filter((i) => i.archived);

    setDumpItems(active);
    setArchivedItems(archived);
    setProjects(projectsRes.data || []);
    setTasks(tasksRes.data || []);

    checkWeeklyNotification(archived);
  }, [userId, autoArchiveStaleItems, checkWeeklyNotification]);

  const staleItems = dumpItems.filter((item) => {
    const hours = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
    const isSnoozed = item.snoozed_until && new Date(item.snoozed_until) > new Date();
    return hours >= STALE_AFTER_HOURS && !isSnoozed;
  });

  const archivedThisWeek = getArchivedThisWeek(archivedItems);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="bg-slate-50 rounded-2xl p-8 text-center">
        <p className="text-slate-600">Veuillez vous connecter pour accéder à cette section</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-light text-slate-700">Projets & Idées</h2>
          <p className="text-slate-500 text-sm mt-1">
            Capturez vos idées et organisez-les en projets
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {archivedThisWeek > 0 && (
            <button
              onClick={() => setShowArchive(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs hover:bg-slate-200 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              {archivedThisWeek} archivée{archivedThisWeek > 1 ? 's' : ''} cette semaine
            </button>
          )}
          {staleItems.length > 0 && (
            <button
              onClick={() => setShowQuickSort(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs hover:bg-orange-200 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Trier {staleItems.length} idée{staleItems.length > 1 ? 's' : ''} ancienne{staleItems.length > 1 ? 's' : ''}
            </button>
          )}
          {archivedItems.length > 0 && (
            <button
              onClick={() => setShowArchive(!showArchive)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-500 rounded-full text-xs hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              Archives ({archivedItems.length})
            </button>
          )}
        </div>
      </div>

      {showWeeklyNotif && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-emerald-700">
            Bonne semaine ! {archivedThisWeek} idée{archivedThisWeek > 1 ? 's ont été archivées' : ' a été archivée'} automatiquement. Pensez à consulter vos archives.
          </p>
          <button
            onClick={() => setShowWeeklyNotif(false)}
            className="ml-4 text-emerald-500 hover:text-emerald-700 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {showArchive && (
        <ArchiveView
          archivedItems={archivedItems}
          projects={projects}
          userId={userId}
          onUpdate={loadAll}
          onClose={() => setShowArchive(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-slate-700">Brain Dump</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {dumpItems.length} idée{dumpItems.length !== 1 ? 's' : ''} en vrac
              </p>
            </div>
            {staleItems.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                {staleItems.length} ancienne{staleItems.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <BrainDump
              items={dumpItems}
              projects={projects}
              userId={userId}
              onUpdate={loadAll}
              onDragStart={(item) => setDraggedItem(item)}
              onSendToJay={async (content, sourceId) => {
                await supabase.from('jay_cross_items').insert({
                  user_id: userId,
                  content,
                  direction: 'to_jay',
                  source_id: sourceId,
                });
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ProjectManager
              projects={projects}
              tasks={tasks}
              userId={userId}
              draggedItem={draggedItem}
              onUpdate={loadAll}
            />
          </div>
        </div>
      </div>

      {showQuickSort && (
        <QuickSortMode
          staleItems={staleItems}
          projects={projects}
          userId={userId}
          onUpdate={loadAll}
          onClose={() => setShowQuickSort(false)}
        />
      )}
    </div>
  );
}
