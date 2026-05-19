/*
  # Projets & Idées - Brain Dump and Project Manager

  1. New Tables

    - `brain_dump_items`
      - `id` (uuid, primary key)
      - `content` (text) - The idea content
      - `note` (text) - Optional expanded note
      - `deadline` (timestamptz) - Optional deadline
      - `archived` (boolean) - Auto-archived after 7 days
      - `archived_at` (timestamptz) - When it was archived
      - `snoozed_until` (timestamptz) - Snooze expiration date
      - `project_id` (uuid, nullable) - If moved to a project
      - `user_id` (uuid)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `idea_projects`
      - `id` (uuid, primary key)
      - `name` (text) - Project name
      - `color` (text) - Color identifier for the project
      - `user_id` (uuid)
      - `created_at` (timestamptz)

    - `project_tasks`
      - `id` (uuid, primary key)
      - `project_id` (uuid) - References idea_projects
      - `title` (text) - Task title
      - `note` (text) - Optional note
      - `deadline` (timestamptz) - Optional deadline
      - `completed` (boolean) - Completion status
      - `completed_at` (timestamptz)
      - `source_dump_id` (uuid, nullable) - Original brain dump item id
      - `user_id` (uuid)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Authenticated users can only access their own data
*/

-- Brain dump items
CREATE TABLE IF NOT EXISTS brain_dump_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  note text DEFAULT '',
  deadline timestamptz,
  archived boolean DEFAULT false,
  archived_at timestamptz,
  snoozed_until timestamptz,
  project_id uuid,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brain_dump_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brain dump items"
  ON brain_dump_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brain dump items"
  ON brain_dump_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brain dump items"
  ON brain_dump_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own brain dump items"
  ON brain_dump_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Idea projects (folders)
CREATE TABLE IF NOT EXISTS idea_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT 'emerald',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE idea_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own idea projects"
  ON idea_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own idea projects"
  ON idea_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own idea projects"
  ON idea_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own idea projects"
  ON idea_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Project tasks
CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES idea_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  note text DEFAULT '',
  deadline timestamptz,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  source_dump_id uuid,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project tasks"
  ON project_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project tasks"
  ON project_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project tasks"
  ON project_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own project tasks"
  ON project_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);