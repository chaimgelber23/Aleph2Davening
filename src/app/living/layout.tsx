import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Jewish Daily Living — Brachot, Blessings & Practical Guides",
  description:
    "Simple guides for Jewish daily life. Learn which brachot to say on food, Shabbat basics, how to put on tefillin, mezuzah placement, kosher rules, and 30+ topics — all explained for beginners.",
  keywords: [
    // Brachot - core
    "brachot", "brachot guide", "Jewish blessings", "bracha", "how to make a bracha",
    "brachot on food", "blessings before food", "blessings after food",
    "which bracha to say", "bracha chart", "food blessings Jewish",
    // Specific brachot
    "hamotzi", "mezonot", "shehakol", "ha'etz", "ha'adama", "borei pri hagafen",
    "birkat hamazon", "benching", "al hamichya",
    "bracha on water", "bracha on fruit", "bracha on vegetables", "bracha on bread",
    // Shabbat
    "Shabbat guide", "Shabbat for beginners", "how to keep Shabbat",
    "Shabbat candles", "kiddush", "havdalah", "Shabbos basics",
    "what to do on Shabbat", "first Shabbat",
    // Tefillin & Mezuzah
    "tefillin guide", "how to put on tefillin", "tefillin for beginners",
    "mezuzah guide", "how to hang a mezuzah", "mezuzah placement",
    // Kosher
    "kosher basics", "what is kosher", "kosher rules explained",
    "kosher for beginners", "keeping kosher",
    // General
    "Jewish daily living", "Jewish practices for beginners", "new to Judaism",
    "Jewish customs explained", "basic Jewish observance",
    "baal teshuva guide", "convert to Judaism guide",
  ],
  openGraph: {
    title: "Jewish Daily Living — Brachot, Blessings & Practical Guides",
    description: "Simple guides for Jewish daily life: brachot, Shabbat, tefillin, mezuzah, kosher, and 30+ topics — all explained for beginners.",
  },
};

export default function LivingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
