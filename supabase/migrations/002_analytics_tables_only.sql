-- ========================================
-- ANALYTICS TABLES ONLY (Safe - won't conflict with existing tables)
-- ========================================

-- Enable UUID extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Raw analytics events (before aggregation)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_category TEXT,

  -- Event-specific metadata
  prayer_id TEXT,
  section_id TEXT,
  audio_source TEXT,
  coaching_phase TEXT,
  lesson_id TEXT,
  service_id TEXT,

  -- Performance metrics
  duration_seconds INTEGER,
  completion_percentage INTEGER,

  -- Context
  user_agent TEXT,
  device_type TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries (safe - will skip if exists)
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_prayer_id ON analytics_events(prayer_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_category ON analytics_events(event_category);

-- Daily analytics summary (aggregated daily by batch job)
CREATE TABLE IF NOT EXISTS daily_analytics_summary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,

  -- User activity
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,

  -- Prayer engagement
  prayer_views JSONB DEFAULT '{}',
  total_prayer_views INTEGER DEFAULT 0,
  prayers_completed INTEGER DEFAULT 0,

  -- Audio engagement
  audio_plays JSONB DEFAULT '{}',
  total_audio_plays INTEGER DEFAULT 0,
  audio_sources_used JSONB DEFAULT '{}',

  -- Coaching engagement
  coaching_sessions_started INTEGER DEFAULT 0,
  coaching_sessions_completed INTEGER DEFAULT 0,
  coaching_phases_breakdown JSONB DEFAULT '{}',

  -- Learning engagement
  lessons_started INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  bootcamp_completions INTEGER DEFAULT 0,

  -- Service engagement
  service_views JSONB DEFAULT '{}',

  -- Time metrics
  avg_session_duration_seconds INTEGER,
  total_study_minutes INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- Auto-update trigger function (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for daily_analytics_summary
DROP TRIGGER IF EXISTS update_daily_analytics_summary_updated_at ON daily_analytics_summary;
CREATE TRIGGER update_daily_analytics_summary_updated_at
  BEFORE UPDATE ON daily_analytics_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Admin users table (for dashboard access control)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  granted_by UUID REFERENCES user_profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on analytics tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admins can view all analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admins can view daily analytics summary" ON daily_analytics_summary;
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Analytics events: users can insert their own events
CREATE POLICY "Users can insert own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Analytics events: admins can view all events
CREATE POLICY "Admins can view all analytics events"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Daily analytics summary: admins can view all summaries
CREATE POLICY "Admins can view daily analytics summary"
  ON daily_analytics_summary FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admin users: admins can view all admin users
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- DATA RETENTION
-- ========================================

-- Function to cleanup old analytics events (90 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
