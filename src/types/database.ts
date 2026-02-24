export interface UserProfileRow {
  id: string;
  email: string;
  display_name: string | null;
  current_level: number;
  nusach: 'ashkenaz' | 'sefard' | 'edot';
  daily_goal_minutes: number;
  transliteration_mode: 'full' | 'faded' | 'tap' | 'off';
  audio_speed: number;
  streak_days: number;
  longest_streak: number;
  last_practice_date: string | null;
  total_study_minutes: number;
  total_words_mastered: number;
  learning_goal: 'daven' | 'learn' | 'explore' | 'all';
  hebrew_level: 'none' | 'some_letters' | 'read_slow' | 'read_improve';
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillProgressRow {
  id: string;
  user_id: string;
  skill_id: string;
  mastery_level: number;
  times_practiced: number;
  times_correct: number;
  last_practiced: string | null;
}

export interface DailySessionRow {
  id: string;
  user_id: string;
  date: string;
  minutes_studied: number;
  items_reviewed: number;
  items_correct: number;
  new_skills_learned: number;
}

export interface MilestoneRow {
  id: string;
  user_id: string;
  type: string;
  earned_at: string;
}

export interface AnalyticsEventRow {
  id: string;
  user_id: string | null;
  session_id: string | null;
  event_type: string;
  event_category: string | null;
  prayer_id: string | null;
  section_id: string | null;
  audio_source: string | null;
  coaching_phase: string | null;
  lesson_id: string | null;
  service_id: string | null;
  duration_seconds: number | null;
  completion_percentage: number | null;
  user_agent: string | null;
  device_type: string | null;
  created_at: string;
}

export interface DailyAnalyticsSummaryRow {
  id: string;
  date: string;
  total_users: number;
  new_users: number;
  active_users: number;
  returning_users: number;
  prayer_views: Record<string, number>;
  total_prayer_views: number;
  prayers_completed: number;
  audio_plays: Record<string, number>;
  total_audio_plays: number;
  audio_sources_used: Record<string, number>;
  coaching_sessions_started: number;
  coaching_sessions_completed: number;
  coaching_phases_breakdown: Record<string, number>;
  lessons_started: number;
  lessons_completed: number;
  bootcamp_completions: number;
  service_views: Record<string, number>;
  avg_session_duration_seconds: number | null;
  total_study_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUserRow {
  id: string;
  user_id: string;
  email: string;
  granted_by: string | null;
  granted_at: string;
}

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfileRow;
        Insert: Omit<UserProfileRow, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfileRow, 'created_at' | 'updated_at'>>;
      };
      skill_progress: {
        Row: SkillProgressRow;
        Insert: Omit<SkillProgressRow, 'id'>;
        Update: Partial<Omit<SkillProgressRow, 'id'>>;
      };
      daily_sessions: {
        Row: DailySessionRow;
        Insert: Omit<DailySessionRow, 'id'>;
        Update: Partial<Omit<DailySessionRow, 'id'>>;
      };
      milestones: {
        Row: MilestoneRow;
        Insert: Omit<MilestoneRow, 'id'>;
        Update: Partial<Omit<MilestoneRow, 'id'>>;
      };
      analytics_events: {
        Row: AnalyticsEventRow;
        Insert: Omit<AnalyticsEventRow, 'id' | 'created_at'>;
        Update: Partial<Omit<AnalyticsEventRow, 'id' | 'created_at'>>;
      };
      daily_analytics_summary: {
        Row: DailyAnalyticsSummaryRow;
        Insert: Omit<DailyAnalyticsSummaryRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DailyAnalyticsSummaryRow, 'id' | 'created_at' | 'updated_at'>>;
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: Omit<AdminUserRow, 'id' | 'granted_at'>;
        Update: Partial<Omit<AdminUserRow, 'id' | 'granted_at'>>;
      };
    };
  };
};
