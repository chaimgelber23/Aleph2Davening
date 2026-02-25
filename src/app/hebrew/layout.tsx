import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Learn Hebrew — Alphabet, Vowels & Reading Practice",
  description:
    "Learn the Hebrew alphabet (Aleph-Bet) from scratch with audio for every letter. Master vowels (nikud), build reading fluency through interactive drills, and practice with spaced repetition.",
  keywords: [
    "learn Hebrew alphabet", "Hebrew letters", "aleph bet", "aleph bet for beginners",
    "Hebrew vowels", "nikud", "nekudot", "learn to read Hebrew",
    "Hebrew reading practice", "Hebrew for beginners", "Hebrew letter sounds",
    "Hebrew consonants", "Hebrew pronunciation", "read Hebrew prayers",
    "Hebrew bootcamp", "Hebrew flashcards", "spaced repetition Hebrew",
  ],
  openGraph: {
    title: "Learn Hebrew — Alphabet, Vowels & Reading Practice",
    description: "Learn the Hebrew alphabet from scratch with audio, interactive drills, and spaced repetition. Master letters, vowels (nikud), and reading fluency.",
  },
};

export default function HebrewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
