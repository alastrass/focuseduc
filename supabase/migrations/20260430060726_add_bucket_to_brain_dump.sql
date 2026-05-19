/*
  # Add time bucket to brain dump items

  1. Changes
    - Add `bucket` column to `brain_dump_items` (text, nullable)
      - Possible values: 'today', 'week', 'month', or NULL (general inbox)
    - Add `bucket_expires_at` column (timestamptz, nullable)
      - When bucket period ends, the note is considered expired and shown as a general quick note again.

  2. Notes
    - Expiration is enforced at read time (client-side cleanup resets expired buckets to NULL).
    - Existing rows default to NULL (general quick notes).
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brain_dump_items' AND column_name = 'bucket'
  ) THEN
    ALTER TABLE brain_dump_items ADD COLUMN bucket text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brain_dump_items' AND column_name = 'bucket_expires_at'
  ) THEN
    ALTER TABLE brain_dump_items ADD COLUMN bucket_expires_at timestamptz;
  END IF;
END $$;
