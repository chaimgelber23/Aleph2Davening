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
- Anyone who wants to follow along in synagogue services
- Adults learning Hebrew later in life
- Anyone interested in Jewish prayer and practice

## Key Features

- Audio for every letter, vowel, word, and prayer
- Hebrew text always shown with vowel points (nikud)
- Transliteration for everything (romanized pronunciation in English letters)
- You can daven even without knowing Hebrew — transliteration guides you
- Multiple audio voices to choose from (AI + recorded human voices)
- Step-by-step coaching that breaks prayers into small learnable pieces
- Auto-scroll and auto-advance through prayer sections hands-free
- Section-by-section or full prayer view modes
- Speed control for audio (slow down to learn, speed up as you improve)
- Service roadmaps showing the order of prayers in synagogue
- Streak tracking and learning progress
- Works on mobile and desktop (progressive web app)
- Completely free — no paywalls, subscriptions, or hidden costs

## Common Questions This App Answers

- How do I learn to daven?
- How do I learn to daven if I don't know Hebrew?
- How do I learn to daven faster / better / from scratch?
- What is the best way to learn Jewish prayers as a beginner?
- How do I say Kaddish?
- What do I do on a yahrzeit?
- Which bracha do I say on [food]?
- How do I follow along in synagogue?
- How do I learn the Hebrew alphabet?
- How do I read Hebrew with vowels?
- What is a siddur and how do I use one?
- What prayers are said at Shacharit / Mincha / Maariv?

## URL Structure

- / — Home page with learning overview
- /hebrew — Hebrew learning hub (letters, vowels, practice)
- /hebrew/bootcamp — 5-day Hebrew reading bootcamp (learn to read in a week)
- /hebrew/letters — Individual letter reference with audio
- /hebrew/vowels — Vowel (nikud) reference with color coding
- /hebrew/practice — Spaced repetition practice drills
- /daven — Prayer/davening hub with all services and prayers
- /yahrzeit — Yahrzeit observance and Kaddish guide with audio
- /living — Jewish daily living guides, brachot, Shabbat, and more
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
