# Aleph2Davening — Gemini Build Instructions

You are building and maintaining **Aleph2Davening**, a Hebrew reading and davening (prayer) web app for Jewish outreach (kiruv). It teaches absolute beginners to decode Hebrew letters and vowels, build reading fluency, and read prayers through interactive drills, audio, and guided siddur practice.

**Live URL**: https://aleph2davening.vercel.app

---

## App Architecture

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion + canvas-confetti |
| Database | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |
| Spaced Repetition | ts-fsrs (FSRS algorithm) |
| State Management | Zustand (persisted to localStorage) |
| Audio | 7-source system + Google Cloud TTS (Hebrew Wavenet) fallback |
| Deployment | Vercel |

### 4-Tab Navigation
| Tab | Route | Content |
|-----|-------|---------|
| Hebrew | `/hebrew` | Letter learning, vowel learning, 5-day bootcamp, spaced repetition practice |
| Daven | `/daven` | Weekday/Shabbat services, all prayers, coaching, amud mode, karaoke sync, prep sheet |
| Yahrzeit | `/yahrzeit` | 4 kaddish types, kaddish placement in services, yahrzeit observance guide |
| Daily Living | `/living` | Brachot (blessings) + 30+ Jewish living guides with quizzes |

Home page (`/`) is a professional overview: greeting, streak, daily goal, quick-access cards. Settings via header gear icon (not a tab).

---

## Design System

### Brand Personality
- **Calm, reverent, encouraging** — like a warm teacher, not a flashy game
- NOT gamified-kiddie, NOT sterile-academic
- Professional but approachable
- No emojis in UI (icons only where genuinely helpful)

### Color Palette
```
Background:       #FEFDFB  (warm off-white)
Surface:          #FFFFFF  (cards, modals)
Primary:          #1B4965  (deep blue — trust, wisdom)
Primary Light:    #5FA8D3  (light blue — interactive elements)
Success:          #4A7C59  (forest green — mastery, completion)
Error:            #C17767  (muted terracotta — gentle correction)
Warning:          #D4A373  (warm amber)
Text Primary:     #2D3142  (near-black)
Text Secondary:   #6B7280  (gray)
Text Hebrew:      #1A1A2E  (deep navy — for Hebrew text)
Accent Gold:      #C6973F  (milestones, celebrations)
Yahrzeit:         #5C4033  (warm brown — yahrzeit tab header)

Vowel Colors (color-coded nekudot for learning):
  AH: #3B82F6 (blue)    — Patach, Kamatz
  EH: #10B981 (green)   — Segol, Tzere
  EE: #F59E0B (amber)   — Chirik
  OH: #8B5CF6 (purple)  — Cholam
  OO: #EF4444 (red)     — Kubutz, Shuruk
  Shva: #9CA3AF (gray)
```

### Typography
```
Hebrew (learning/large):   'Noto Serif Hebrew', serif — 28-36px, line-height: 2.0
Hebrew (reading/siddur):   'Noto Serif Hebrew', serif — 22-26px, line-height: 1.8
Hebrew (UI labels):        'Noto Sans Hebrew', sans-serif — 16-18px
English (headings):        'Playfair Display', serif
English (body/UI):         'Inter', system-ui, sans-serif — 16px, line-height: 1.6
```

CSS variables already configured in layout.tsx:
- `var(--font-inter)` — English body
- `var(--font-playfair)` — English headings
- `var(--font-hebrew-serif)` — Hebrew text
- `var(--font-hebrew-sans)` — Hebrew UI labels

### Component Patterns

**Primary Button:**
```tsx
className="bg-[#1B4965] text-white px-8 py-4 rounded-xl font-medium hover:bg-[#163d55] transition-colors"
```

**Success Button:**
```tsx
className="bg-[#4A7C59] text-white px-6 py-3 rounded-xl font-medium"
```

**Card:**
```tsx
className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
```

**Hebrew Display (Learning):**
```tsx
className="font-[var(--font-hebrew-serif)] text-4xl text-[#1A1A2E] leading-[2] text-right"
style={{ direction: 'rtl' }}
```

**Tab Bar (segmented control):**
```tsx
className="flex gap-1 bg-gray-100 rounded-xl p-1"
// Active tab:
className="flex-1 py-2.5 rounded-lg text-xs font-semibold bg-white text-[#1B4965] shadow-sm"
// Inactive tab:
className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700"
```

**Bottom Nav Tab:**
```tsx
// Active:
className="text-[#1B4965] font-semibold"
// Inactive:
className="text-gray-400"
```

### Animation Patterns
Use Framer Motion for all animations. Keep them subtle and purposeful.

```tsx
// Staggered card entrance
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.03 }}
/>

// Page header slide-in
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
/>

// Success celebration — use canvas-confetti sparingly
import confetti from 'canvas-confetti';
confetti({ particleCount: 80, spread: 60 });
```

---

## Critical Rules

### Hebrew Text
1. **ALWAYS show nekudot** (vowel points) on all Hebrew text. Never show unpointed text to beginners.
2. **ALWAYS use `dir="rtl"`** on Hebrew text containers.
3. **ALWAYS use Noto Serif Hebrew** for Hebrew content (`font-[var(--font-hebrew-serif)]`).
4. Never render raw Hebrew strings — wrap in proper styled containers.

### Audio
1. Every letter, vowel, word, and prayer MUST have audio. No silent learning.
2. Audio system has 7 sources: `siddur-audio`, `chabad`, `hadar-weiss`, `hadar-richman`, `hadar-diamond`, `hadar-rosenbaum`, `google-tts`.
3. Use `AudioSourcePicker` component for per-prayer source selection.
4. Google Cloud TTS is the automatic fallback (Hebrew Wavenet voices).
5. Use the `useAudio` hook: `{ play, playSource, stop, pause, resume, seek, isPlaying, isLoading, error, currentTime, duration }`.

### Pedagogy
1. **3-7 minute sessions** — one concept per lesson.
2. **End on a win** — every session must end with something the user gets right.
3. **No shame, ever** — error states are gentle, missed streaks are forgiving, tone is warm.
4. **Connect to meaning** — before teaching a prayer, explain WHY Jews say it.
5. Letters taught in research-backed order (visually distinct first, then confusable pairs).
6. Vowels taught by sound group: AH → EH → EE → OH → OO → Shva.
7. Prayers follow davening progression: Modeh Ani → Brachot → Shema → Amidah.

### Mobile-First
1. Minimum 48px touch targets on all interactive elements.
2. Test at 375px width minimum.
3. Bottom nav is always visible with 4 tabs.
4. Scrollable content areas with proper padding for bottom nav (pb-28).

---

## Project Structure

```
aleph2davening/
├── src/
│   ├── app/                       # App Router pages
│   │   ├── page.tsx               # Home / overview dashboard
│   │   ├── layout.tsx             # Root layout (fonts, providers)
│   │   ├── hebrew/                # Hebrew tab
│   │   │   ├── page.tsx           # Hub page (cards to sub-sections)
│   │   │   ├── letters/           # Letter learning
│   │   │   ├── vowels/            # Vowel learning
│   │   │   ├── bootcamp/          # 5-day bootcamp (day1-day5 sub-routes)
│   │   │   └── practice/          # Spaced repetition drills
│   │   ├── daven/                 # Daven tab
│   │   │   └── page.tsx           # Services + All Prayers (2-tab)
│   │   ├── yahrzeit/              # Yahrzeit tab
│   │   │   └── page.tsx           # Kaddish types, services, observance (3-tab)
│   │   ├── living/                # Daily Living tab
│   │   │   └── page.tsx           # Brachot + Guides (2-tab)
│   │   ├── onboarding/            # Onboarding flow
│   │   ├── settings/              # Settings page
│   │   └── api/                   # API routes (Google TTS, etc.)
│   ├── components/
│   │   ├── ui/                    # Shared: BottomNav, HebrewText, etc.
│   │   ├── learn/                 # Lesson/teaching components
│   │   ├── practice/              # Drill/exercise components
│   │   ├── siddur/                # Prayer reader, karaoke, coaching
│   │   ├── guide/                 # Guide reader, cards, quiz
│   │   ├── bootcamp/              # Bootcamp day components
│   │   ├── audio/                 # Audio player/recorder
│   │   └── progress/              # Progress visualization
│   ├── hooks/
│   │   ├── useAudio.ts            # Audio playback hook (7 sources + TTS)
│   │   └── useKaraokeSync.ts      # Word-by-word karaoke highlighting
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── fsrs.ts                # Spaced repetition engine
│   │   ├── google-tts.ts          # Google Cloud TTS client
│   │   ├── sync.ts                # Cloud sync utilities
│   │   └── content/               # All curriculum data
│   │       ├── letters.ts         # Hebrew letter data + teaching order
│   │       ├── vowels.ts          # Vowel/nekudot data
│   │       ├── prayers.ts         # Prayer content + sections
│   │       ├── audio-sources.ts   # 7-source audio registry + PRAYER_AUDIO_MAP
│   │       ├── guides.ts          # 30+ Jewish living guides (70KB)
│   │       └── yahrzeit.ts        # Kaddish types, services, observance
│   ├── stores/                    # Zustand stores (persisted)
│   │   ├── userStore.ts           # Profile, preferences, guide progress
│   │   ├── progressStore.ts       # Learning progress (letters, vowels)
│   │   ├── practiceStore.ts       # Current practice session
│   │   └── bootcampStore.ts       # Bootcamp progress
│   └── types/
│       └── index.ts               # All TypeScript types
├── public/
│   └── audio/                     # Pre-recorded audio files
│       ├── letters/               # Individual letter sounds
│       ├── vowels/                # Vowel sounds
│       ├── words/                 # Word pronunciations
│       └── prayers/               # Prayer audio (with word timings)
└── supabase/
    └── migrations/                # Database migrations
```

---

## Key Data Types

```typescript
// Audio
type AudioSourceId = 'siddur-audio' | 'chabad' | 'hadar-weiss' | 'hadar-richman' | 'hadar-diamond' | 'hadar-rosenbaum' | 'google-tts';

// Kaddish
type KaddishType = 'half' | 'full' | 'mourners' | 'derabanan';

// Guides
type GuideCategory = 'shabbat' | 'daily' | 'holidays' | 'lifecycle' | 'food' | 'concepts';

// Learning
type HebrewLetter = { letter: string; name: string; sound: string; sofit?: boolean; ... };
type VowelGroup = 'AH' | 'EH' | 'EE' | 'OH' | 'OO' | 'SHVA';

// Prayer
type Prayer = { id: string; nameHebrew: string; nameEnglish: string; sections: PrayerSection[]; ... };
```

---

## Zustand Store Keys
- `aleph2davening-user` — user profile, preferences, guide progress
- `aleph2davening-bootcamp` — bootcamp progress

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ELEVENLABS_API_KEY=
GOOGLE_TTS_CREDENTIALS=
REPLICATE_API_TOKEN=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## When Building New Features

1. **Read CLAUDE.md first** — it has the same info in a format optimized for Claude Code.
2. **Follow existing patterns** — look at how similar features are built before creating new ones.
3. **Use existing components** — HebrewText, BottomNav, card patterns, tab patterns.
4. **Keep the tone** — warm, encouraging, no shame. This is for beginners exploring Judaism.
5. **Audio is mandatory** — if you add any Hebrew content, it needs audio.
6. **Test at mobile width** — this is primarily a phone app.
7. **Run `npm run build`** after every significant change to catch errors early.
