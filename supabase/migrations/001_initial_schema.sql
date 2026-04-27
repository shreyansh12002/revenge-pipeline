-- Initial schema for YouTube Content System

-- App configuration table (key-value store)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom subreddits configuration
CREATE TABLE IF NOT EXISTS custom_subreddits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories table with full metadata
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apify_id TEXT UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author TEXT DEFAULT '[deleted]',
  subreddit TEXT NOT NULL,
  url TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  viral_score INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('raw', 'scripted', 'packaged', 'exported')) DEFAULT 'raw',

  -- AI Generated Content
  script JSONB,
  youtube_package JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_viral_score ON stories(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_stories_subreddit ON stories(subreddit);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- Insert default subreddits
INSERT INTO custom_subreddits (name, display_name) VALUES
  ('ProRevenge', 'Pro Revenge'),
  ('NuclearRevenge', 'Nuclear Revenge'),
  ('MaliciousCompliance', 'Malicious Compliance'),
  ('EntitledPeople', 'Entitled People'),
  ('AmITheAsshole', 'Am I The A**hole'),
  ('TrueOffMyChest', 'True Off My Chest')
ON CONFLICT (name) DO NOTHING;