import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "5-Day Hebrew Bootcamp — Learn to Read Hebrew in a Week",
  description:
    "Free 5-day program to learn the Hebrew alphabet and start reading. Each day covers new letters with audio, practice drills, and real Hebrew words. No prior knowledge needed.",
  keywords: [
    "learn Hebrew in a week", "Hebrew bootcamp", "5 day Hebrew course",
    "learn Hebrew fast", "Hebrew crash course", "read Hebrew quickly",
    "Hebrew alphabet course", "beginner Hebrew program", "free Hebrew course",
  ],
  openGraph: {
    title: "5-Day Hebrew Bootcamp — Learn to Read Hebrew in a Week",
    description: "Free 5-day program to learn the Hebrew alphabet and start reading. Audio, drills, and real words — no prior knowledge needed.",
  },
};

export default function BootcampLayout({ children }: { children: React.ReactNode }) {
  return children;
}
