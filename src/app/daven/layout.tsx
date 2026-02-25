import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Learn to Daven — Jewish Prayer Guide with Audio & Transliteration",
  description:
    "Interactive siddur with audio for every prayer, transliteration, English translation, and step-by-step coaching. Learn Modeh Ani, Shema, Amidah, and all weekday & Shabbat prayers.",
  keywords: [
    "learn to daven", "Jewish prayer guide", "siddur with transliteration", "siddur audio",
    "how to pray Jewish", "modeh ani prayer", "shema prayer", "amidah guide", "shemoneh esrei",
    "Jewish prayer for beginners", "learn Jewish prayers English", "davening guide",
    "weekday prayer service", "shabbat prayer service", "shacharit", "mincha", "maariv",
    "prayer with transliteration", "Hebrew prayer audio",
  ],
  openGraph: {
    title: "Learn to Daven — Jewish Prayer Guide with Audio",
    description: "Interactive siddur with audio, transliteration, and coaching for every Jewish prayer. From Modeh Ani to Amidah.",
  },
};

export default function DavenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
