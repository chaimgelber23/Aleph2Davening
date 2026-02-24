'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { DailyAnalyticsSummaryRow } from '@/types/database';

type TimeRange = 'today' | 'week' | 'month' | 'all';

export default function AdminDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [summaries, setSummaries] = useState<DailyAnalyticsSummaryRow[]>([]);

  // Check admin access
  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        router.push('/');
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        router.push('/');
        return;
      }

      setIsAdmin(true);
      loadAnalytics();
    }

    checkAdmin();
  }, [user, router]);

  // Load analytics data
  async function loadAnalytics() {
    setLoading(true);

    const now = new Date();
    let startDate: string;

    switch (timeRange) {
      case 'today':
        startDate = now.toISOString().split('T')[0];
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      default:
        startDate = '2024-01-01'; // All time
    }

    const { data, error } = await supabase
      .from('daily_analytics_summary')
      .select('*')
      .gte('date', startDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to load analytics:', error);
    } else {
      setSummaries(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) loadAnalytics();
  }, [timeRange, isAdmin]);

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4965] mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Aggregate totals
  const totals = summaries.reduce(
    (acc, s) => ({
      activeUsers: acc.activeUsers + s.active_users,
      prayerViews: acc.prayerViews + s.total_prayer_views,
      audioPlays: acc.audioPlays + s.total_audio_plays,
      coachingSessions: acc.coachingSessions + s.coaching_sessions_started,
      studyMinutes: acc.studyMinutes + s.total_study_minutes,
    }),
    { activeUsers: 0, prayerViews: 0, audioPlays: 0, coachingSessions: 0, studyMinutes: 0 }
  );

  // Top prayers
  const prayerViewsMap = new Map<string, number>();
  summaries.forEach((s) => {
    Object.entries(s.prayer_views || {}).forEach(([prayerId, count]) => {
      prayerViewsMap.set(prayerId, (prayerViewsMap.get(prayerId) || 0) + count);
    });
  });
  const topPrayers = Array.from(prayerViewsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Audio source breakdown
  const audioSourceMap = new Map<string, number>();
  summaries.forEach((s) => {
    Object.entries(s.audio_plays || {}).forEach(([source, count]) => {
      audioSourceMap.set(source, (audioSourceMap.get(source) || 0) + count);
    });
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B4965] text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-[#5FA8D3] mt-2">Aleph2Davening Analytics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Time filter */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-6">
          {(['today', 'week', 'month', 'all'] as TimeRange[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setTimeRange(opt)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                timeRange === opt
                  ? 'bg-white text-[#1B4965] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-600 font-medium">Active Users</p>
            <p className="text-3xl font-bold text-[#1B4965] mt-2">{totals.activeUsers.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-600 font-medium">Prayer Views</p>
            <p className="text-3xl font-bold text-[#1B4965] mt-2">{totals.prayerViews.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-600 font-medium">Audio Plays</p>
            <p className="text-3xl font-bold text-[#1B4965] mt-2">{totals.audioPlays.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-600 font-medium">Coaching Sessions</p>
            <p className="text-3xl font-bold text-[#1B4965] mt-2">{totals.coachingSessions.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-600 font-medium">Study Minutes</p>
            <p className="text-3xl font-bold text-[#1B4965] mt-2">{totals.studyMinutes.toLocaleString()}</p>
          </div>
        </div>

        {/* Top prayers */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Most Viewed Prayers</h2>
          <div className="space-y-3">
            {topPrayers.map(([prayerId, count]) => (
              <div key={prayerId} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{prayerId.replace(/-/g, ' ')}</span>
                <span className="font-semibold text-[#1B4965]">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audio sources */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Audio Source Usage</h2>
          <div className="space-y-3">
            {Array.from(audioSourceMap.entries()).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{source.replace(/-/g, ' ')}</span>
                <span className="font-semibold text-[#1B4965]">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily breakdown table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Daily Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-right py-3 px-4">Active Users</th>
                  <th className="text-right py-3 px-4">Prayer Views</th>
                  <th className="text-right py-3 px-4">Audio Plays</th>
                  <th className="text-right py-3 px-4">Coaching</th>
                  <th className="text-right py-3 px-4">Study Min</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{s.date}</td>
                    <td className="text-right py-3 px-4">{s.active_users}</td>
                    <td className="text-right py-3 px-4">{s.total_prayer_views}</td>
                    <td className="text-right py-3 px-4">{s.total_audio_plays}</td>
                    <td className="text-right py-3 px-4">{s.coaching_sessions_started}</td>
                    <td className="text-right py-3 px-4">{s.total_study_minutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
