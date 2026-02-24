# Files Created/Modified for Analytics

## 📁 New Files Created

### Database & Schema
```
supabase/migrations/001_initial_schema.sql
```
- Complete database schema with 7 tables
- RLS policies, indexes, helper functions

### Admin Dashboard
```
src/app/admin/page.tsx
```
- Admin dashboard with metrics, charts, and filters

### API Routes
```
src/app/api/analytics/beacon/route.ts
```
- Beacon endpoint for guaranteed event delivery on page close

### Documentation
```
ANALYTICS_SETUP.md
DEPLOYMENT_GUIDE.md  ← START HERE
FILES_CREATED.md (this file)
```

---

## 📝 Modified Files

### Type Definitions
```
src/types/index.ts
```
- Added `AnalyticsEventType`, `AnalyticsEventCategory`, `AnalyticsEvent`

```
src/types/database.ts
```
- Added `AnalyticsEventRow`, `DailyAnalyticsSummaryRow`, `AdminUserRow`
- Updated `Database` type with new tables

### Analytics System
```
src/lib/analytics.ts
```
- **REPLACED** simple stub with full batched tracking system
- Local event queue, auto-flush every 30 seconds
- SendBeacon for page unload

### Event Tracking (Added `track()` calls)
```
src/app/daven/page.tsx
```
- Track prayer views (line ~110)
- Track service views (line ~118)

```
src/hooks/useAudio.ts
```
- Track audio playback (lines ~207, ~217)
- Captures audio source (siddur-audio, chabad, young-israel, etc.)

```
src/components/siddur/CoachingOverlay.tsx
```
- Track coaching start (useEffect on mount)
- Track coaching phase completion (in advancePhase)
- Track coaching complete (in handleFeedback)

---

## 🗂️ File Structure Overview

```
aleph2davening/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql ········· NEW (database schema)
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx ··················· NEW (admin dashboard)
│   │   ├── api/
│   │   │   └── analytics/
│   │   │       └── beacon/
│   │   │           └── route.ts ··········· NEW (beacon API)
│   │   └── daven/
│   │       └── page.tsx ··················· MODIFIED (added tracking)
│   ├── components/
│   │   └── siddur/
│   │       └── CoachingOverlay.tsx ········ MODIFIED (added tracking)
│   ├── hooks/
│   │   └── useAudio.ts ···················· MODIFIED (added tracking)
│   ├── lib/
│   │   └── analytics.ts ··················· REPLACED (full implementation)
│   └── types/
│       ├── index.ts ······················· MODIFIED (added analytics types)
│       └── database.ts ···················· MODIFIED (added table types)
├── ANALYTICS_SETUP.md ························ NEW (technical docs)
├── DEPLOYMENT_GUIDE.md ······················· NEW (step-by-step guide)
└── FILES_CREATED.md ·························· NEW (this file)
```

---

## 🎯 What Each File Does

### Database (`001_initial_schema.sql`)
Creates 7 tables:
1. `user_profiles` - User data (email, preferences, streaks)
2. `skill_progress` - Hebrew skill mastery tracking
3. `daily_sessions` - Daily practice summaries
4. `milestones` - Achievement tracking
5. **`analytics_events`** - Raw event tracking (NEW)
6. **`daily_analytics_summary`** - Aggregated metrics (NEW)
7. **`admin_users`** - Admin access control (NEW)

### Admin Dashboard (`src/app/admin/page.tsx`)
- Protected route (checks `admin_users` table)
- Displays:
  - Metric cards (active users, prayer views, audio plays, etc.)
  - Time filter (Today, Week, Month, All Time)
  - Top prayers breakdown
  - Audio source usage stats
  - Daily breakdown table

### Analytics System (`src/lib/analytics.ts`)
- `track(event: AnalyticsEvent)` - Main function to track events
- Local queue (max 20 events)
- Auto-flush every 30 seconds
- SendBeacon on page close for guaranteed delivery
- Device type detection
- Session ID management

### Beacon API (`src/app/api/analytics/beacon/route.ts`)
- Accepts POST requests with batched events
- Uses service role key to insert events
- Called by browser's `navigator.sendBeacon()` on page unload

---

## 🔢 Total Changes

- **7 new files** created
- **5 files** modified
- **~1,500 lines** of code added
- **3 documentation** files

---

## ⚙️ Environment Variables Needed

Add to Vercel (or `.env.local`):

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Existing vars (already configured):
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚀 Quick Start

1. **Deploy database:** `supabase db push`
2. **Grant admin access:** Insert into `admin_users` table (see DEPLOYMENT_GUIDE.md)
3. **Add service role key:** Add to Vercel environment variables
4. **Deploy:** `git push` (Vercel auto-deploys)
5. **Test:** Visit `/admin` to see analytics dashboard

**Full instructions:** See `DEPLOYMENT_GUIDE.md`
