import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ChecklistItem = {
  id: string;
  shift_name: string;
  title: string;
  completed: boolean;
  order_index: number;
  user_id: string;
  completed_at: string | null;
  created_at: string;
};

export type Referent = {
  id: string;
  name: string;
  weekly_meeting_done: boolean;
  last_meeting_date: string | null;
  user_id: string;
  created_at: string;
};

export type QuickNote = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
};

export type AdminSession = {
  id: string;
  duration: number;
  completed: boolean;
  notes: string;
  user_id: string;
  created_at: string;
};

export type EnergyLog = {
  id: string;
  user_id: string;
  shift_name: string;
  score: number;
  log_type: 'start' | 'end';
  created_at: string;
};

export type ReferentWeeklyCompletion = {
  id: string;
  user_id: string;
  year: number;
  week_number: number;
  created_at: string;
};

export type BrainDumpItem = {
  id: string;
  content: string;
  note: string;
  deadline: string | null;
  archived: boolean;
  archived_at: string | null;
  snoozed_until: string | null;
  project_id: string | null;
  bucket: 'today' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'team_meeting' | 'week' | 'month' | null;
  bucket_expires_at: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type IdeaProject = {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
};

export type ProjectTask = {
  id: string;
  project_id: string;
  title: string;
  note: string;
  deadline: string | null;
  completed: boolean;
  completed_at: string | null;
  source_dump_id: string | null;
  user_id: string;
  created_at: string;
};
