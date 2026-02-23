# Amud Mode - Teaching Everyone to Understand & Lead Davening

## What is Amud Mode?

"Amud" (עמוד) means "podium" in Hebrew. When someone leads davening, they stand at the amud (the front of the synagogue) and serve as the **Shaliach Tzibbur** (שליח ציבור) — the "messenger of the congregation."

**Amud Mode is NOT a separate mode** — it's integrated into the regular prayer experience to teach EVERYONE how davening works in shul, whether they're just following along or preparing to lead.

## Why This Matters

### For Beginners
- **Understand what's happening in shul**: See who says what, when to respond, and what the flow is
- **Follow along confidently**: Know when to stand, sit, bow, or respond "Amen"
- **Learn the liturgical structure**: Understand why prayers are in a certain order

### For People Preparing to Lead
- **See the path clearly**: Step-by-step guide showing exactly what you'll do as the Shaliach Tzibbur
- **Know today's variations**: Calendar-aware system tells you about Tachnun, Rosh Chodesh, fast days, Monday/Thursday differences
- **Avoid overwhelming details**: Focus on the flow, not minutiae

## Features Built

### 1. Service Calendar Utility (`service-calendar.ts`)

Automatically determines what's said on any given day:

```typescript
import { getTodaysServiceVariations } from '@/lib/calendar/service-calendar';

const today = getTodaysServiceVariations();
// Returns:
// - hasTachnun: boolean
// - hasLongTachnun: boolean (Monday/Thursday)
// - hasHallel: boolean
// - hallelType: 'full' | 'half'
// - hasYaalehVeyavo: boolean
// - hasMussaf: boolean
// - isRoshChodesh: boolean
// - isFastDay: boolean
// - notes: string[] (human-readable explanations)
```

**Calendar Rules Implemented:**
- ✅ **Rosh Chodesh**: No Tachnun, Half Hallel, Mussaf, Ya'aleh V'yavo
- ✅ **Monday/Thursday**: Extended Tachnun with extra verses
- ✅ **Fast Days**: Special prayers instead of Tachnun
- ✅ **Chanukah**: Full Hallel, no Tachnun
- ✅ **Purim**: No Tachnun
- ✅ **Tu B'Shvat, Lag B'Omer, Tu B'Av**: No Tachnun
- ✅ **Month of Nissan**: No Tachnun all month
- ✅ **Yamim Tovim**: Appropriate Hallel, Mussaf, Ya'aleh V'yavo

### 2. Today's Service Path Component (`TodaysServicePath.tsx`)

A **step-by-step roadmap** for leading davening, showing:

- **YOUR ROLE** at each step: Lead, Silent, Together, or Respond
- **What you do**: Clear instructions for each section
- **Tips**: Practical guidance (e.g., "Wait for the congregation here")
- **Today's variations**: Highlights conditional sections based on the calendar
  - 🔴 **Red highlighted**: Special additions or skips for today
  - 📍 **Step numbers**: Clear progression through the service
  - 🎙️ **Role icons**: Visual indicators of your responsibility

**Example Output for Rosh Chodesh:**

```
Today's Notes:
- Rosh Chodesh: No Tachnun today
- Say Half Hallel after Shacharit
- Lead Mussaf after the main service

Before You Begin:
✓ Rosh Chodesh today - Add Ya'aleh V'yavo in the Amidah
✓ Say Half Hallel after Shacharit
✓ Lead Mussaf after the main service
✓ Skip Tachnun

The Service Flow:
1. 🤫 SILENT - Opening Blessings (congregation prays quietly)
2. 🎙️ YOU LEAD - Barechu (call out, wait for response)
3. 👥 TOGETHER - Shema & Blessings
4. 🤫 SILENT - Silent Amidah
5. ⚠️ IMPORTANT - Add Ya'aleh V'yavo (easy to forget!)
6. 🎙️ YOU LEAD - Chazzan's Repetition
7. ✓ Skip Tachnun - Go straight to Ashrei [HIGHLIGHTED]
8. 🎙️ YOU LEAD - Half Hallel [HIGHLIGHTED]
9. 🎙️ YOU LEAD - Mussaf [HIGHLIGHTED]
10. 🙋 YOU RESPOND - Mourner's Kaddish
```

### 3. Amud Cue Component (`AmudCue.tsx`)

**Inline liturgical instructions** that appear BEFORE each section of prayer:

Shows:
- **Who says it**: Badge with icon (🎙️ Prayer Leader, 👥 Congregation, 🤫 Silent, 🎵 Together)
- **How to say it**: Instructions (e.g., "Say this aloud", "Wait for congregation")
- **Physical actions**: 🧘 Stand, Bow, Cover eyes, Take 3 steps, etc.
- **Congregation responses**: What the congregation says in response (with Hebrew, transliteration)
- **Pause cues**: ⏸️ When to wait for the congregation
- **Tips**: 💡 Helpful context notes

**Two Display Modes:**
1. **Beginner Mode** (default): Full explanations with all details
2. **Compact Mode**: Minimal, for experienced users who just need a reminder

**Example:**
```
┌─────────────────────────────────────────────┐
│ 🎙️ PRAYER LEADER                           │
│ The Shaliach Tzibbur says this aloud        │
│ 🧘 Stand  🧘 Bow                            │
│                                             │
│ The congregation responds:                  │
│ ┌─────────────────────────────────────────┐ │
│ │ אָמֵן                                    │ │
│ │ Amen                                    │ │
│ └─────────────────────────────────────────┘ │
│ ⏸️ Pause and wait for congregation         │
└─────────────────────────────────────────────┘

[Hebrew prayer text appears here]
Transliteration
Translation
```

### 4. Prayer Reader with Integrated Amud Cues (`PrayerReader.tsx`)

The main prayer display component now shows:
- Hebrew text with nikud (vowel points)
- Transliteration & translation
- **Amud cues BEFORE each section** (so you know what's about to happen)
- Adjustable font size for Hebrew
- Toggles for showing/hiding transliteration, translation, instructions, amud cues

**User Controls:**
- Show Amud Cues: ON/OFF (from display settings)
- Beginner Mode: Full explanations vs. compact cues
- Font Size: Small/Medium/Large for Hebrew text
- Show Transliteration: ON/OFF
- Show Translation: ON/OFF
- Show Instructions: ON/OFF

### 5. Amud Roles Guide (`AmudRolesGuide` in `AmudCue.tsx`)

A **beginner-friendly explainer** of the four roles:

1. **🎙️ Shaliach Tzibbur (Prayer Leader)** - Says prayers aloud for everyone
2. **👥 Congregation** - Everyone says this together
3. **🎵 Everyone Together** - Leader and congregation in unison
4. **🤫 Silent (Individual)** - Each person prays quietly at their own pace

Includes "Why does this matter?" section explaining the educational value.

## How This All Fits Together

### Scenario 1: Learning to Follow Along in Shul

**User:** "I'm going to shul for the first time and have no idea what's happening."

**Experience:**
1. Opens the **Weekday Shacharit** service
2. Sees each prayer with **Amud Cues** showing:
   - "👥 CONGREGATION - Everyone says this together"
   - "🎙️ PRAYER LEADER - The chazzan says this aloud, you listen"
   - "🤫 SILENT - Each person says this quietly to themselves"
3. Knows when to stand, sit, bow
4. Sees when to respond "Amen" or "Y'hei sh'mei raba"
5. Understands the flow: "Oh, after the silent Amidah, the leader repeats it aloud!"

### Scenario 2: Preparing to Lead Davening

**User:** "I'm leading Shacharit tomorrow. What do I need to know?"

**Experience:**
1. Opens **Today's Service Path**
2. Sees:
   - "Today's Notes: Regular weekday - Tachnun is recited"
   - "Before You Begin" prep checklist
   - Step-by-step path showing exactly what they'll do
   - Key moments to wait for congregation
3. Can review each prayer with Amud Cues to see:
   - Where to pause
   - What the congregation responds
   - Physical actions (stand for Kaddish, bow during Aleinu)

### Scenario 3: Leading on Rosh Chodesh (First Time)

**User:** "I'm leading davening on Rosh Chodesh. What's different?"

**Experience:**
1. Opens **Today's Service Path** on Rosh Chodesh day
2. Sees **highlighted sections**:
   - ⚠️ "Add Ya'aleh V'yavo in Amidah (easy to forget!)"
   - ✓ "Skip Tachnun today - go straight to Ashrei"
   - "Say Half Hallel"
   - "Lead Mussaf after the main service"
3. The calendar system **automatically** shows these variations
4. No need to know Rosh Chodesh rules — the app tells them

### Scenario 4: Monday/Thursday Differences

**User:** "Why is today's davening longer?"

**Experience:**
1. Opens service on Monday or Thursday
2. Sees: "Monday/Thursday: Extended Tachnun with additional verses"
3. In the Tachnun section, sees:
   - "🎙️ YOU LEAD - Tachnun (LONG version)"
   - "Say the extended Tachnun (Monday/Thursday version with extra verses)"
4. Understands this is normal for Mon/Thu, not a mistake

## Data Structure

Every prayer section can have an `amud` field:

```typescript
interface AmudAnnotation {
  role: 'shaliach_tzibbur' | 'congregation' | 'both' | 'silent_individual';
  instruction?: string; // "Say this aloud", "Wait for congregation"
  congregationResponse?: string; // Hebrew text of response
  congregationResponseTransliteration?: string; // "Amen", "Baruch Hu"
  physicalActions?: PhysicalAction[]; // ['stand', 'bow']
  waitForCongregation?: boolean; // Pause after this
  notes?: string; // Additional context
}
```

**Example from Barechu:**

```typescript
{
  hebrewText: 'בָּרְכוּ אֶת ה\' הַמְּבֹרָךְ',
  transliteration: 'Barechu et Adonai ha-m\'vorach',
  translation: 'Bless the Lord who is blessed',
  amud: {
    role: 'shaliach_tzibbur',
    instruction: 'Call out loudly to the congregation',
    congregationResponse: 'בָּרוּךְ ה\' הַמְּבֹרָךְ לְעוֹלָם וָעֶד',
    congregationResponseTransliteration: 'Baruch Adonai ha-m\'vorach l\'olam va-ed',
    physicalActions: ['stand', 'bow'],
    waitForCongregation: true,
    notes: 'This is your first public call. Say it clearly and confidently.',
  },
}
```

## Pedagogical Approach

### Key Principles

1. **Everyone needs to understand the flow** — not just people leading
   - Helps beginners follow along in shul
   - Demystifies the liturgical structure
   - Makes davening less intimidating

2. **Amud mode is about the PATH, not overwhelming details**
   - Show what you'll DO, not what you'll THINK
   - Step-by-step progression
   - Highlight the key moments

3. **Calendar-aware = less stress**
   - No need to memorize Tachnun rules
   - App tells you what's different today
   - Automatically adjusts for Rosh Chodesh, fast days, etc.

4. **Explain for someone who doesn't know**
   - "Shaliach Tzibbur means messenger of the congregation"
   - "This is when everyone stands"
   - "The congregation responds: Amen"

5. **Integration, not separation**
   - Amud cues are PART of regular prayer view
   - Not a special "leader mode" — everyone sees it
   - Builds liturgical literacy for all users

## Future Enhancements

### Phase 2 (Not Yet Built)
- [ ] Audio cues for when to start/stop as leader
- [ ] Practice mode with congregation response playback
- [ ] Timer showing how long you have left in service
- [ ] "You are here" indicator during live davening
- [ ] Custom service builder (e.g., skip certain sections)
- [ ] Nusach selector (Ashkenaz, Sefard, Sefardic)

### Phase 3 (Advanced)
- [ ] Torah reading choreography (aliyot, hagbah, gelilah)
- [ ] Chazzanut notation (traditional melodies)
- [ ] Multi-person coordination (who says what kaddish)
- [ ] Shabbat-specific additions (Yekum Purkan, Av Harachamim)
- [ ] High Holiday variations (Yamim Noraim changes)

## Files Created

```
src/
├── lib/
│   └── calendar/
│       └── service-calendar.ts         # Calendar logic for daily variations
└── components/
    └── daven/
        ├── TodaysServicePath.tsx       # Step-by-step path for leading
        ├── AmudCue.tsx                 # Inline liturgical instruction component
        │   └── AmudRolesGuide          # Beginner's guide to roles
        └── PrayerReader.tsx            # Prayer display with integrated amud cues
```

## Usage Examples

### In a Service/Daven Page

```tsx
import TodaysServicePath from '@/components/daven/TodaysServicePath';

export default function DavenPrep() {
  return (
    <div>
      <TodaysServicePath />
    </div>
  );
}
```

### In a Prayer Detail Page

```tsx
import PrayerReader from '@/components/daven/PrayerReader';
import { KADDISH_HALF } from '@/lib/content/service-prayers';

export default function KaddishPage() {
  const displaySettings = {
    showTransliteration: true,
    showTranslation: true,
    showInstructions: true,
    showAmudCues: true, // Show liturgical cues
  };

  return (
    <PrayerReader
      prayer={KADDISH_HALF}
      displaySettings={displaySettings}
      showAmudCues={true}
    />
  );
}
```

### Checking Today's Variations Programmatically

```tsx
import { getTodaysServiceVariations, getTodaysServiceExplanation } from '@/lib/calendar/service-calendar';

const variations = getTodaysServiceVariations();

if (variations.hasTachnun) {
  console.log('Say Tachnun today');
  if (variations.hasLongTachnun) {
    console.log('Use the Monday/Thursday long version');
  }
}

if (variations.isRoshChodesh) {
  console.log('Add Ya\'aleh V\'yavo and say Mussaf');
}

// Human-readable explanation
const explanation = getTodaysServiceExplanation();
console.log(explanation);
// "Today is Rosh Chodesh. We do NOT say Tachnun today. We say Half Hallel. We add Ya'aleh V'yavo..."
```

## Design Consistency

All components follow the Aleph2Davening design system:

- **Colors**:
  - Primary: `#1B4965` (Prayer Leader badge)
  - Light Blue: `#5FA8D3` (Congregation badge)
  - Purple: `#8B5CF6` (Together badge)
  - Gray: `#6B7280` (Silent badge)
  - Amber: `#D4A373` (Special notes, highlights)
  - Gold: `#C6973F` (Inspiration text)

- **Typography**:
  - Hebrew: `Noto Serif Hebrew` (with nikud)
  - English: `Inter`, system-ui

- **Tone**: Calm, reverent, encouraging. Never overwhelming.

## Conclusion

This system accomplishes your vision:

✅ **Combine amud instructions with regular prayer** — Everyone learns the flow, not just leaders
✅ **Super clear path for leading** — Step-by-step, not overwhelming
✅ **Calendar-aware variations** — Tachnun rules, Monday/Thursday, Rosh Chodesh, fast days all handled
✅ **Explain like they don't know** — "Your job as Shaliach Tzibbur is..." with full context
✅ **Daily updates** — "Today we skip Tachnun because..." shown automatically

The result: **Beginners can follow along in shul. People preparing to lead see exactly what they'll do. The app teaches everyone to understand davening, not just read it.**
