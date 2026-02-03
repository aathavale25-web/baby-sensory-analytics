-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  theme TEXT NOT NULL,
  duration INTEGER NOT NULL,
  touches INTEGER NOT NULL,
  color_counts JSONB NOT NULL DEFAULT '{}',
  object_counts JSONB NOT NULL DEFAULT '{}',
  nursery_rhymes_played TEXT[] NOT NULL DEFAULT '{}',
  streaks INTEGER NOT NULL DEFAULT 0,
  milestones INTEGER[] NOT NULL DEFAULT '{}',
  completed_full BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable all access for now" ON sessions;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Enable all access for now" ON sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);
