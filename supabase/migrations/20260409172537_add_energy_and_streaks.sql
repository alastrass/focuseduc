/*
  # Energy Logs & Weekly Streak Tracking

  1. New Tables

    - `energy_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `shift_name` (text) - Which shift this reading belongs to
      - `score` (integer 1-5) - Energy level
      - `log_type` (text) - 'start' or 'end'
      - `created_at` (timestamptz)

    - `referent_weekly_completions`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `year` (integer) - Calendar year
      - `week_number` (integer) - ISO week number (1-53)
      - `created_at` (timestamptz)
      Unique constraint on (user_id, year, week_number) to avoid duplicates.

  2. Security
    - Enable RLS on both tables
    - Authenticated users can only access their own data
*/

CREATE TABLE IF NOT EXISTS energy_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  shift_name text NOT NULL,
  score integer NOT NULL CHECK (score BETWEEN 1 AND 5),
  log_type text NOT NULL DEFAULT 'start',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE energy_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own energy logs"
  ON energy_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own energy logs"
  ON energy_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own energy logs"
  ON energy_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own energy logs"
  ON energy_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS referent_weekly_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  year integer NOT NULL,
  week_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, year, week_number)
);

ALTER TABLE referent_weekly_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly completions"
  ON referent_weekly_completions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly completions"
  ON referent_weekly_completions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly completions"
  ON referent_weekly_completions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly completions"
  ON referent_weekly_completions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);