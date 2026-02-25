import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Yahrzeit & Kaddish Guide — How to Say Kaddish, Audio & Transliteration",
  description:
    "Complete guide to yahrzeit observance and saying Kaddish. Includes Mourner's Kaddish with audio, transliteration, translation, and step-by-step guidance for synagogue services.",
  keywords: [
    "yahrzeit", "yahrzeit guide", "yahrzeit observance", "what to do on yahrzeit",
    "kaddish", "mourner's kaddish", "kaddish prayer", "how to say kaddish",
    "kaddish transliteration", "kaddish audio", "kaddish English translation",
    "kaddish yatom", "mourner's prayer", "Jewish mourning",
    "kaddish in synagogue", "when to say kaddish", "kaddish guide",
  ],
  openGraph: {
    title: "Yahrzeit & Kaddish Guide — Audio, Transliteration & Step-by-Step",
    description: "Complete guide to yahrzeit observance and Kaddish. Audio, transliteration, and guidance for saying Kaddish in synagogue.",
  },
};

export default function YahrzeitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
