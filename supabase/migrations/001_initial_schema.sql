-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CORE USER TABLES
-- ========================================

-- User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  current_level INTEGER DEFAULT 1,
  nusach TEXT DEFAULT 'ashkenaz' CHECK (nusach IN ('ashkenaz', 'sefard', 'edot')),
  daily_goal_minutes INTEGER DEFAULT 5,
  transliteration_mode TEXT DEFAULT 'full' CHECK (transliteration_mode IN ('full', 'faded', 'tap', 'off')),
  audio_speed NUMERIC DEFAULT 1.0,
  voice_gender TEXT DEFAULT 'male' CHECK (voice_gender IN ('male', 'female')),
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  total_study_minutes INTEGER DEFAULT 0,
  total_words_mastered INTEGER DEFAULT 0,
  learning_goal TEXT DEFAULT 'daven' CHECK (learning_goal IN ('daven', 'learn', 'explore', 'all')),
  hebrew_level TEXT DEFAULT 'none' CHECK (hebrew_level IN ('none', 'some_letters', 'read_slow', 'read_improve')),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Skill progress (letters, vowels, words)
CREATE TABLE skill_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  mastery_level NUMERIC DEFAULT 0,
  times_practiced INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE TRIGGER update_skill_progress_updated_at
  BEFORE UPDATE ON skill_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Daily sessions (daily summary of practice)
CREATE TABLE daily_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  minutes_studied INTEGER DEFAULT 0,
  items_reviewed INTEGER DEFAULT 0,
  items_correct INTEGER DEFAULT 0,
  new_skills_learned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TRIGGER update_daily_sessions_updated_at
  BEFORE UPDATE ON daily_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Milestones (achievements)
CREATE TABLE milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ANALYTICS TABLES
-- ========================================

-- Raw analytics events (before aggregation)
CREATE TABLE analytics_events (
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

-- Indexes for analytics queries
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_prayer_id ON analytics_events(prayer_id);
CREATE INDEX idx_analytics_events_event_category ON analytics_events(event_category);

-- Daily analytics summary (aggregated daily by batch job)
CREATE TABLE daily_analytics_summary (
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

CREATE TRIGGER update_daily_analytics_summary_updated_at
  BEFORE UPDATE ON daily_analytics_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Admin users table (for dashboard access control)
CREATE TABLE admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  granted_by UUID REFERENCES user_profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- User profiles: users can read/write their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Skill progress: users can manage their own progress
CREATE POLICY "Users can view own skill progress"
  ON skill_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill progress"
  ON skill_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill progress"
  ON skill_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily sessions: users can manage their own sessions
CREATE POLICY "Users can view own daily sessions"
  ON daily_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily sessions"
  ON daily_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily sessions"
  ON daily_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Milestones: users can view/insert their own
CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

-- Grant admin access to the first user (manual step after setup)
-- INSERT INTO admin_users (user_id, email) VALUES ('<your-user-id>', '<your-email>');
