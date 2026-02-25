import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Jewish Daily Living — Brachot, Blessings & Practical Guides",
  description:
    "Guides for Jewish daily life: blessings before and after food (brachot), Shabbat basics, mezuzah, tefillin, kosher, and 30+ topics explained simply for beginners.",
  keywords: [
    "brachot", "Jewish blessings", "bracha guide", "blessings before food",
    "brachot on food", "hamotzi", "mezonot", "shehakol", "ha'etz", "ha'adama",
    "Jewish daily living", "Shabbat guide", "Shabbat for beginners",
    "mezuzah guide", "tefillin guide", "kosher basics",
    "Jewish practices", "how to make a bracha", "Jewish food blessings",
  ],
  openGraph: {
    title: "Jewish Daily Living — Brachot, Blessings & Practical Guides",
    description: "Simple guides for Jewish daily life: blessings, Shabbat, mezuzah, tefillin, kosher, and 30+ topics for beginners.",
  },
};

export default function LivingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
