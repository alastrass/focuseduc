/*
  # FocusEduc Database Schema

  1. New Tables
    - `shifts`
      - `id` (uuid, primary key)
      - `name` (text) - "Matin", "Après-midi", "Journée"
      - `user_id` (uuid) - References auth.users
      - `created_at` (timestamptz)
    
    - `checklist_items`
      - `id` (uuid, primary key)
      - `shift_name` (text) - Which shift this belongs to
      - `title` (text) - Task title
      - `completed` (boolean) - Completion status
      - `order_index` (integer) - Display order
      - `user_id` (uuid) - References auth.users
      - `completed_at` (timestamptz) - When it was completed
      - `created_at` (timestamptz)
    
    - `referents`
      - `id` (uuid, primary key)
      - `name` (text) - Resident name
      - `weekly_meeting_done` (boolean) - Meeting status
      - `last_meeting_date` (timestamptz) - Last meeting date
      - `user_id` (uuid) - References auth.users
      - `created_at` (timestamptz)
    
    - `quick_notes`
      - `id` (uuid, primary key)
      - `content` (text) - Note content
      - `user_id` (uuid) - References auth.users
      - `created_at` (timestamptz)
    
    - `admin_sessions`
      - `id` (uuid, primary key)
      - `duration` (integer) - Session duration in minutes
      - `completed` (boolean) - Whether session was completed
      - `notes` (text) - Session notes
      - `user_id` (uuid) - References auth.users
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shifts"
  ON shifts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shifts"
  ON shifts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shifts"
  ON shifts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shifts"
  ON shifts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_name text NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false,
  order_index integer DEFAULT 0,
  user_id uuid NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist items"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist items"
  ON checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist items"
  ON checklist_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist items"
  ON checklist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create referents table
CREATE TABLE IF NOT EXISTS referents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  weekly_meeting_done boolean DEFAULT false,
  last_meeting_date timestamptz,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referents"
  ON referents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referents"
  ON referents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referents"
  ON referents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own referents"
  ON referents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create quick_notes table
CREATE TABLE IF NOT EXISTS quick_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quick notes"
  ON quick_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick notes"
  ON quick_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick notes"
  ON quick_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quick notes"
  ON quick_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  duration integer DEFAULT 25,
  completed boolean DEFAULT false,
  notes text DEFAULT '',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own admin sessions"
  ON admin_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own admin sessions"
  ON admin_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own admin sessions"
  ON admin_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own admin sessions"
  ON admin_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);