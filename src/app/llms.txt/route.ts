export function GET() {
  const content = `# Aleph2Davening

> Free web app to learn Hebrew reading and Jewish prayer — from the Aleph-Bet to leading the amud.

## What This App Does

Aleph2Davening is an interactive learning platform for:

1. **Learning the Hebrew Alphabet (Aleph-Bet)**: All 22 Hebrew letters taught in research-backed order with audio pronunciation for every letter. Includes a 5-day bootcamp that takes complete beginners to basic reading ability.

2. **Hebrew Vowels (Nikud/Nekudot)**: Color-coded vowel system teaching all Hebrew vowel points — Patach, Kamatz, Segol, Tzere, Chirik, Cholam, Kubutz, Shuruk, and Shva. Each with audio.

3. **Reading Practice**: Spaced repetition drills (FSRS algorithm) for building Hebrew reading fluency. Practice individual letters, vowel combinations, and real Hebrew words.

4. **Jewish Prayer (Davening)**: Complete interactive siddur covering all weekday and Shabbat prayers. Every prayer includes:
   - Hebrew text with vowels (nikud)
   - Audio playback (AI voice + multiple recorded voices)
   - Transliteration (romanized pronunciation)
   - English translation
   - Step-by-step coaching mode
   - Auto-advance audio through sections
   - Service roadmaps showing prayer order

5. **Prayers Covered**: Modeh Ani, Morning Brachot, Shema and its Blessings, Amidah (Shemoneh Esrei), Ashrei, Aleinu, and more for Shacharit, Mincha, and Maariv services.

6. **Yahrzeit & Kaddish**: Complete guide to yahrzeit observance including Mourner's Kaddish with audio, transliteration, English translation. Covers when and where Kaddish is said in services.

7. **Jewish Daily Living**: 30+ guides covering brachot (blessings before/after food), Shabbat basics, mezuzah, tefillin, kosher, and other Jewish practices — all explained simply for beginners.

## Target Audience

- Complete beginners with no Hebrew knowledge
- Jews returning to practice (baalei teshuvah)
- Converts learning Jewish practice
- Anyone preparing for a bar/bat mitzvah
- People wanting to say Kaddish for a loved one
- Anyone interested in Jewish prayer and practice

## Key Features

- Audio for every letter, vowel, word, and prayer
- Hebrew text always shown with vowel points (nikud)
- Transliteration for everything (romanized pronunciation)
- Multiple audio voices to choose from
- Step-by-step coaching that breaks prayers into small pieces
- Auto-scroll and auto-advance through prayer sections
- Streak tracking and learning progress
- Works on mobile and desktop (progressive web app)
- Completely free — no paywalls or subscriptions

## Technical Details

- Built with Next.js, deployed on Vercel
- Hebrew text uses Noto Serif Hebrew font
- Audio via Google Cloud TTS (Hebrew Wavenet) + pre-recorded voices
- Spaced repetition powered by ts-fsrs (FSRS algorithm)

## URL Structure

- / — Home page with learning overview
- /hebrew — Hebrew learning hub (letters, vowels, practice)
- /hebrew/bootcamp — 5-day Hebrew reading bootcamp
- /hebrew/letters — Individual letter reference
- /hebrew/vowels — Vowel (nikud) reference
- /hebrew/practice — Spaced repetition practice
- /daven — Prayer/davening hub with all services and prayers
- /yahrzeit — Yahrzeit observance and Kaddish guide
- /living — Jewish daily living guides and brachot
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
