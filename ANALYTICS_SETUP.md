# Analytics & Admin Dashboard - Setup Guide

## ✅ What's Been Implemented

### 1. Database Schema (`supabase/migrations/001_initial_schema.sql`)
- ✅ Core user tables: `user_profiles`, `skill_progress`, `daily_sessions`, `milestones`
- ✅ Analytics tables: `analytics_events`, `daily_analytics_summary`, `admin_users`
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Helper functions for admin checks and data cleanup

### 2. TypeScript Types
- ✅ Analytics event types added to `src/types/index.ts`
- ✅ Database table types added to `src/types/database.ts`

### 3. Analytics System (`src/lib/analytics.ts`)
- ✅ Batched event tracking (30-second flush interval)
- ✅ Local queue with automatic flush when full (20 events)
- ✅ SendBeacon for guaranteed delivery on page close
- ✅ Device type detection
- ✅ Session ID tracking

### 4. Event Tracking Instrumentation
- ✅ Prayer views and service views (`src/app/daven/page.tsx`)
- ✅ Audio playback tracking (`src/hooks/useAudio.ts`)
- ✅ Coaching engagement tracking (`src/components/siddur/CoachingOverlay.tsx`)

### 5. API Routes
- ✅ Beacon endpoint for page unload events (`src/app/api/analytics/beacon/route.ts`)

### 6. Admin Dashboard
- ✅ Protected admin page (`src/app/admin/page.tsx`)
- ✅ Time range filtering (Today, Week, Month, All Time)
- ✅ Metric cards for key stats
- ✅ Top prayers breakdown
- ✅ Audio source usage stats
- ✅ Daily breakdown table

---

## 🚀 Deployment Steps

### Step 1: Run Database Migration

```bash
cd c:\Users\chaim\Aleph2Davening
supabase db push
```

This will create all tables, indexes, RLS policies, and helper functions.

### Step 2: Grant Admin Access

After deploying the schema, grant yourself admin access by running this SQL in the Supabase SQL Editor:

```sql
-- Replace with your actual user ID and email
INSERT INTO admin_users (user_id, email)
VALUES ('<your-supabase-user-id>', 'your-email@example.com');
```

**To find your user ID:**
1. Sign up/sign in to your app
2. Go to Supabase Dashboard → Authentication → Users
3. Find your user and copy the UUID

### Step 3: Add Environment Variable

Add the following to your Vercel environment variables (or `.env.local` for local development):

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**To find your service role key:**
1. Go to Supabase Dashboard → Project Settings → API
2. Copy the `service_role` secret key

### Step 4: Deploy to Vercel

```bash
git add .
git commit -m "Add analytics and admin dashboard

- Complete SQL schema with analytics tables
- Batched event tracking system
- Prayer, audio, and coaching tracking
- Protected admin dashboard
- Beacon API for guaranteed event delivery

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

Vercel will automatically deploy.

### Step 5: Test the Analytics Flow

1. ✅ Sign up a new user
2. ✅ View a prayer → check `analytics_events` table in Supabase
3. ✅ Play audio → verify `audio_source` field is populated
4. ✅ Start coaching → verify coaching events
5. ✅ Wait 30 seconds → verify events are flushed to database
6. ✅ Access `/admin` as non-admin → verify redirect
7. ✅ Access `/admin` as admin → verify dashboard loads

---

## 📊 Daily Aggregation (Optional)

The current implementation tracks raw events. For optimal dashboard performance, you should set up daily aggregation:

### Option A: Supabase Edge Function (Recommended)

1. Create `supabase/functions/aggregate-analytics/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');
    const targetDate = dateParam || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch events for target date
    const { data: events } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', `${targetDate}T00:00:00Z`)
      .lt('created_at', `${new Date(new Date(targetDate).getTime() + 86400000).toISOString().split('T')[0]}T00:00:00Z`);

    // Aggregate metrics
    const userIds = new Set<string>();
    const prayerViews: Record<string, number> = {};
    const audioPlays: Record<string, number> = {};
    let totalPrayerViews = 0;
    let totalAudioPlays = 0;
    let coachingSessionsStarted = 0;

    events?.forEach((event) => {
      if (event.user_id) userIds.add(event.user_id);

      switch (event.event_type) {
        case 'prayer_view':
          totalPrayerViews++;
          if (event.prayer_id) {
            prayerViews[event.prayer_id] = (prayerViews[event.prayer_id] || 0) + 1;
          }
          break;
        case 'audio_play':
          totalAudioPlays++;
          if (event.audio_source) {
            audioPlays[event.audio_source] = (audioPlays[event.audio_source] || 0) + 1;
          }
          break;
        case 'coaching_start':
          coachingSessionsStarted++;
          break;
      }
    });

    // Upsert summary
    const summary = {
      date: targetDate,
      active_users: userIds.size,
      prayer_views: prayerViews,
      total_prayer_views: totalPrayerViews,
      audio_plays: audioPlays,
      total_audio_plays: totalAudioPlays,
      coaching_sessions_started: coachingSessionsStarted,
    };

    await supabase
      .from('daily_analytics_summary')
      .upsert(summary, { onConflict: 'date' });

    return new Response(
      JSON.stringify({ success: true, date: targetDate, activeUsers: userIds.size }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

2. Deploy the function:

```bash
supabase functions deploy aggregate-analytics
```

3. Schedule it to run daily (in Supabase SQL Editor):

```sql
SELECT cron.schedule(
  'aggregate-daily-analytics',
  '0 2 * * *', -- 2 AM UTC daily
  $$
  SELECT net.http_post(
    url := 'https://<your-project-ref>.supabase.co/functions/v1/aggregate-analytics',
    headers := '{"Authorization": "Bearer <your-service-role-key>"}'::jsonb
  );
  $$
);
```

### Option B: Manual Aggregation

Until you set up the edge function, the admin dashboard will query raw `analytics_events` directly. This works fine for small-scale usage but may be slow with thousands of events.

To manually aggregate for testing:
```sql
-- Run this SQL to create a summary for yesterday
INSERT INTO daily_analytics_summary (date, active_users, total_prayer_views, total_audio_plays)
SELECT
  CURRENT_DATE - INTERVAL '1 day' as date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) FILTER (WHERE event_type = 'prayer_view') as total_prayer_views,
  COUNT(*) FILTER (WHERE event_type = 'audio_play') as total_audio_plays
FROM analytics_events
WHERE created_at >= (CURRENT_DATE - INTERVAL '1 day')
  AND created_at < CURRENT_DATE;
```

---

## 🔐 Security Notes

1. **Admin Access**: Only users in the `admin_users` table can view analytics
2. **RLS Policies**: Row Level Security prevents unauthorized access
3. **Service Role Key**: Keep `SUPABASE_SERVICE_ROLE_KEY` secret (never commit to git)
4. **Data Retention**: Raw events auto-delete after 90 days (via cleanup function)

---

## 📈 What Data is Being Tracked

### Prayer Engagement
- `prayer_view` - When a prayer is opened
- `prayer_complete` - When a prayer is finished
- Includes: `prayerId`, `sectionId`

### Audio Playback
- `audio_play` - When audio starts playing
- `audio_complete` - When audio finishes
- Includes: `prayerId`, `sectionId`, `audioSource` (siddur-audio, chabad, young-israel, google-tts)

### Coaching Engagement
- `coaching_start` - Coaching overlay opened
- `coaching_phase_complete` - Each coaching phase finished (listen, follow_along, etc.)
- `coaching_complete` - Full coaching flow completed
- Includes: `prayerId`, `sectionId`, `coachingPhase`

### Service Navigation
- `service_view` - When a service is opened
- `service_item_select` - When a service item is clicked
- Includes: `serviceId`

### Metadata Tracked
- `user_id` - Who (null for anonymous users)
- `session_id` - Browser session
- `device_type` - mobile, tablet, or desktop
- `created_at` - When the event occurred

---

## 🎯 Next Steps

1. ✅ Deploy the migration
2. ✅ Grant yourself admin access
3. ✅ Test analytics tracking
4. ✅ Access admin dashboard at `/admin`
5. ⏳ (Optional) Set up daily aggregation Edge Function
6. ⏳ (Optional) Add charts/visualizations (Recharts, Chart.js, etc.)

---

## 🐛 Troubleshooting

### "No data in admin dashboard"
- Check that you're signed in as an admin user
- Verify events are being created in `analytics_events` table
- Make sure time range filter includes dates with data

### "Access denied" when viewing /admin
- Confirm your user ID is in the `admin_users` table
- Check RLS policies are enabled and correct

### "Events not being tracked"
- Check browser console for analytics errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- Test with `track({ eventType: 'prayer_view', eventCategory: 'prayer', prayerId: 'test' })`

---

**Implementation complete!** 🎉

All core analytics tracking is now live. Events are being recorded, and you can view aggregated data in the admin dashboard at `/admin`.
