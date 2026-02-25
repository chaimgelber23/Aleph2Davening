import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Learn Hebrew — Alphabet, Vowels & Reading Practice",
  description:
    "Learn to read Hebrew from scratch — no experience needed. Master the Hebrew alphabet (Aleph-Bet) with audio for every letter, color-coded vowels (nikud), interactive drills, and a free 5-day bootcamp.",
  keywords: [
    // Core intent
    "learn Hebrew alphabet", "learn Hebrew letters", "learn to read Hebrew",
    "learn Hebrew from scratch", "learn Hebrew for beginners", "Hebrew for beginners",
    "teach me Hebrew", "I want to learn Hebrew", "how to learn Hebrew fast",
    "learn Hebrew reading", "learn Hebrew quickly", "Hebrew crash course",
    // Aleph-Bet
    "aleph bet", "aleph bet for beginners", "aleph bet chart", "aleph bet with audio",
    "aleph bet sounds", "Hebrew alphabet sounds", "Hebrew alphabet chart",
    "Hebrew alphabet for adults", "Hebrew ABCs",
    // Vowels
    "Hebrew vowels", "nikud", "nekudot", "Hebrew vowel points",
    "learn Hebrew vowels", "Hebrew vowels for beginners",
    "kamatz", "patach", "segol", "tzere", "chirik", "cholam", "shuruk",
    // Practice & learning
    "Hebrew reading practice", "Hebrew letter sounds", "Hebrew pronunciation",
    "Hebrew flashcards", "Hebrew drills", "spaced repetition Hebrew",
    "Hebrew reading app", "Hebrew learning app", "free Hebrew course",
    // Context
    "read Hebrew prayers", "Hebrew for davening", "read the siddur",
    "learn Hebrew for prayer", "adult Hebrew learner",
    "Hebrew for bar mitzvah", "Hebrew for bat mitzvah",
    "baal teshuva Hebrew", "convert learn Hebrew",
  ],
  openGraph: {
    title: "Learn Hebrew — Alphabet, Vowels & Reading Practice",
    description: "Learn to read Hebrew from scratch with audio, interactive drills, and a free 5-day bootcamp. No experience needed.",
  },
};

export default function HebrewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
