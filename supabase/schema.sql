-- Schema definition for Plannerly MVP

-- Create custom users table to mirror Supabase auth users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT auth.uid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  state TEXT DEFAULT 'INITIAL',
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  type TEXT,
  budget INTEGER,
  location JSONB,
  event_date DATE,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  category TEXT,
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_searches  ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy example: allow users to access their own conversations
CREATE POLICY IF NOT EXISTS "User can access own conversations" ON conversations
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );
