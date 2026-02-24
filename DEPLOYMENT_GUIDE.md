# Analytics Deployment Guide - Step by Step

Follow these steps **in order** to deploy the analytics system.

---

## STEP 1: Deploy the Database Schema

### 1a. Open your terminal in the project folder

```bash
cd c:\Users\chaim\Aleph2Davening
```

### 1b. Make sure you're logged into Supabase

```bash
supabase login
```

### 1c. Link to your Supabase project (if not already linked)

```bash
supabase link --project-ref <your-project-ref>
```

Find your project ref at: https://supabase.com/dashboard/project/_/settings/general

### 1d. Push the migration to create all tables

```bash
supabase db push
```

This will create:
- ✅ `user_profiles` table
- ✅ `skill_progress` table
- ✅ `daily_sessions` table
- ✅ `milestones` table
- ✅ `analytics_events` table (NEW)
- ✅ `daily_analytics_summary` table (NEW)
- ✅ `admin_users` table (NEW)
- ✅ All indexes and RLS policies

**Expected output:**
```
Applying migration 001_initial_schema.sql...
Migration applied successfully
```

---

## STEP 2: Grant Yourself Admin Access

### 2a. Sign up/sign in to your app first

Go to your app (localhost or deployed URL) and sign up or sign in with your email.

### 2b. Find your user ID

1. Go to https://supabase.com/dashboard
2. Click on your project
3. Go to **Authentication** → **Users** in the left sidebar
4. Find your email in the list
5. Copy the **UUID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### 2c. Open Supabase SQL Editor

1. In Supabase Dashboard, go to **SQL Editor** in the left sidebar
2. Click **New query**

### 2d. Run this SQL (replace with your actual user ID and email)

```sql
INSERT INTO admin_users (user_id, email)
VALUES ('YOUR-USER-ID-HERE', 'your-email@example.com');
```

**Example:**
```sql
INSERT INTO admin_users (user_id, email)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'chaim@example.com');
```

Click **Run** (or press Ctrl+Enter).

**Expected output:**
```
Success. 1 row inserted.
```

---

## STEP 3: Add Service Role Key to Vercel

### 3a. Get your Service Role Key

1. Go to https://supabase.com/dashboard
2. Click on your project
3. Go to **Project Settings** → **API** in the left sidebar
4. Under "Project API keys", find **service_role** (⚠️ Secret key)
5. Click **Copy** to copy the key

### 3b. Add to Vercel Environment Variables

#### If deploying to Vercel:

1. Go to https://vercel.com/dashboard
2. Click on your project (`aleph2davening`)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Name: `SUPABASE_SERVICE_ROLE_KEY`
6. Value: Paste the service role key you copied
7. Select **Production**, **Preview**, and **Development**
8. Click **Save**

#### If testing locally:

1. Open `.env.local` in your project folder
2. Add this line (replace with your actual key):

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1yZWYiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjIwMTU1NzU5OTl9.YOUR-ACTUAL-SERVICE-ROLE-KEY-HERE
```

3. Save the file

---

## STEP 4: Deploy to Vercel

### 4a. Commit all changes

```bash
git add .
git commit -m "Add analytics and admin dashboard

- Complete SQL schema with analytics tables
- Batched event tracking system
- Prayer, audio, and coaching tracking
- Protected admin dashboard
- Beacon API for guaranteed event delivery

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 4b. Push to GitHub

```bash
git push
```

Vercel will automatically deploy.

### 4c. Wait for deployment to complete

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Wait for the deployment to show "Ready" status (usually 1-3 minutes)

---

## STEP 5: Test the Analytics System

### 5a. Test anonymous tracking (no login required)

1. Go to your deployed app (or `http://localhost:3000`)
2. Click on the **Daven** tab
3. Open a prayer (e.g., "Modeh Ani")
4. Play the audio
5. Wait 30 seconds for events to flush

### 5b. Check events in Supabase

1. Go to Supabase Dashboard → **Table Editor** → `analytics_events`
2. You should see rows with:
   - `event_type`: `prayer_view`, `audio_play`
   - `prayer_id`: `modeh-ani`
   - `audio_source`: `siddur-audio`
   - `device_type`: `desktop` or `mobile`

### 5c. Test admin dashboard

1. Go to your app at `/admin`
   - Example: `https://your-app.vercel.app/admin`
   - Or locally: `http://localhost:3000/admin`

2. You should see:
   - Time filter (Today, Week, Month, All Time)
   - Metric cards (Active Users, Prayer Views, etc.)
   - Most Viewed Prayers list
   - Audio Source Usage list
   - Daily Breakdown table

**If you're redirected to home:**
- Double-check you're signed in
- Verify your user ID is in the `admin_users` table (Step 2)

---

## STEP 6: Create Test Data (Optional)

To see the dashboard with more data, you can manually insert test events:

### 6a. Open Supabase SQL Editor

Go to **SQL Editor** → **New query**

### 6b. Insert test analytics events

```sql
-- Insert 50 test prayer views
INSERT INTO analytics_events (user_id, event_type, event_category, prayer_id, device_type, created_at)
SELECT
  NULL, -- anonymous user
  'prayer_view',
  'prayer',
  (ARRAY['modeh-ani', 'shema', 'aleinu', 'ashrei', 'baruch-sheamar'])[floor(random() * 5 + 1)],
  (ARRAY['mobile', 'desktop', 'tablet'])[floor(random() * 3 + 1)],
  NOW() - (random() * INTERVAL '7 days')
FROM generate_series(1, 50);

-- Insert 30 test audio plays
INSERT INTO analytics_events (user_id, event_type, event_category, prayer_id, audio_source, device_type, created_at)
SELECT
  NULL,
  'audio_play',
  'audio',
  (ARRAY['modeh-ani', 'shema', 'aleinu'])[floor(random() * 3 + 1)],
  (ARRAY['siddur-audio', 'chabad', 'young-israel', 'google-tts'])[floor(random() * 4 + 1)],
  'desktop',
  NOW() - (random() * INTERVAL '7 days')
FROM generate_series(1, 30);

-- Insert 20 coaching events
INSERT INTO analytics_events (user_id, event_type, event_category, prayer_id, coaching_phase, device_type, created_at)
SELECT
  NULL,
  'coaching_start',
  'coaching',
  (ARRAY['modeh-ani', 'shema'])[floor(random() * 2 + 1)],
  'listen',
  'mobile',
  NOW() - (random() * INTERVAL '7 days')
FROM generate_series(1, 20);
```

Click **Run**.

### 6c. Refresh admin dashboard

Go to `/admin` and refresh the page. You should now see populated charts and metrics!

---

## STEP 7: Daily Aggregation (Advanced - Optional)

By default, the admin dashboard queries raw events. For better performance with lots of data, set up daily aggregation:

### Option A: Manual Aggregation (Quick Test)

Run this SQL in Supabase SQL Editor to create a summary for yesterday:

```sql
INSERT INTO daily_analytics_summary (
  date,
  active_users,
  total_users,
  new_users,
  returning_users,
  prayer_views,
  total_prayer_views,
  audio_plays,
  total_audio_plays,
  coaching_sessions_started
)
SELECT
  CURRENT_DATE - INTERVAL '1 day' as date,
  COUNT(DISTINCT user_id) as active_users,
  0 as total_users,
  0 as new_users,
  0 as returning_users,
  jsonb_object_agg(
    COALESCE(prayer_id, 'unknown'),
    COUNT(*) FILTER (WHERE event_type = 'prayer_view' AND prayer_id = analytics_events.prayer_id)
  ) FILTER (WHERE event_type = 'prayer_view') as prayer_views,
  COUNT(*) FILTER (WHERE event_type = 'prayer_view') as total_prayer_views,
  jsonb_object_agg(
    COALESCE(audio_source, 'unknown'),
    COUNT(*) FILTER (WHERE event_type = 'audio_play' AND audio_source = analytics_events.audio_source)
  ) FILTER (WHERE event_type = 'audio_play') as audio_plays,
  COUNT(*) FILTER (WHERE event_type = 'audio_play') as total_audio_plays,
  COUNT(*) FILTER (WHERE event_type = 'coaching_start') as coaching_sessions_started
FROM analytics_events
WHERE created_at >= (CURRENT_DATE - INTERVAL '1 day')
  AND created_at < CURRENT_DATE
GROUP BY date;
```

### Option B: Automated Daily Aggregation (Supabase Edge Function)

This requires more setup. See the full guide in `ANALYTICS_SETUP.md` under "Daily Aggregation (Optional)".

---

## ✅ Deployment Complete!

You now have:
- ✅ Analytics tracking on all prayer views, audio plays, and coaching
- ✅ Admin dashboard at `/admin`
- ✅ Real-time event tracking with 30-second batch flush
- ✅ Secure RLS policies protecting user data

---

## 🐛 Troubleshooting

### Problem: "No data in admin dashboard"

**Solution:**
1. Check that you viewed some prayers (Step 5a)
2. Wait 30 seconds for events to flush
3. Refresh the `/admin` page
4. Check Supabase Table Editor → `analytics_events` to verify events exist

### Problem: "Redirected to home when accessing /admin"

**Solution:**
1. Make sure you're signed in to the app
2. Verify your user ID is in the `admin_users` table:
   ```sql
   SELECT * FROM admin_users;
   ```
3. If not, run Step 2d again with correct user ID

### Problem: "Service role key error"

**Solution:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is in Vercel environment variables
2. Check the key is correct (copy from Supabase Dashboard → Settings → API)
3. Redeploy after adding the env var

### Problem: "Migration failed"

**Solution:**
1. Check you're linked to the correct Supabase project:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
2. Try resetting and re-pushing:
   ```bash
   supabase db reset
   supabase db push
   ```

---

## 📊 What Gets Tracked

Every time someone uses your app, these events are automatically tracked:

| Event | When it fires | Data captured |
|-------|---------------|---------------|
| `prayer_view` | User opens a prayer | prayer ID, section ID |
| `audio_play` | User plays audio | prayer ID, audio source (Siddur/Chabad/Young Israel) |
| `coaching_start` | User starts coaching | prayer ID, section ID |
| `coaching_phase_complete` | User completes a coaching phase | coaching phase (listen, follow_along, etc.) |
| `service_view` | User opens a service | service ID |

All events include:
- Timestamp
- User ID (if signed in, null if anonymous)
- Session ID
- Device type (mobile/tablet/desktop)

---

## 📈 Next Steps

1. **Monitor usage** - Check `/admin` regularly to see which prayers are most popular
2. **Track audio sources** - See if people prefer Chabad, Siddur Audio, or Young Israel recordings
3. **Optimize content** - Focus on improving the most-viewed prayers
4. **Coaching insights** - See where people drop off in the coaching flow

**Need help?** Check `ANALYTICS_SETUP.md` for advanced features like custom aggregations and visualizations.
