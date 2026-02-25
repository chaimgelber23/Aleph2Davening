import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Yahrzeit & Kaddish Guide — How to Say Kaddish, Audio & Transliteration",
  description:
    "Need to say Kaddish? Complete guide with audio, transliteration, English translation, and step-by-step help. Also covers yahrzeit observance, what to do, and when Kaddish is said in services.",
  keywords: [
    // Kaddish - core
    "kaddish", "mourner's kaddish", "kaddish prayer", "how to say kaddish",
    "learn kaddish", "kaddish for beginners", "say kaddish for the first time",
    "I need to say kaddish", "kaddish help",
    // Kaddish - learning aids
    "kaddish transliteration", "kaddish pronunciation", "kaddish in English",
    "kaddish audio", "kaddish recording", "listen to kaddish",
    "kaddish English translation", "kaddish text", "kaddish words",
    "kaddish phonetic", "kaddish romanized",
    // Kaddish - types
    "kaddish yatom", "mourner's prayer", "half kaddish", "full kaddish",
    "kaddish d'rabbanan", "burial kaddish",
    // Kaddish - context
    "kaddish in synagogue", "when to say kaddish", "where to say kaddish in service",
    "kaddish at shiva", "kaddish for a parent", "kaddish for mother", "kaddish for father",
    "how long do you say kaddish", "kaddish 11 months",
    // Yahrzeit
    "yahrzeit", "yahrzeit guide", "yahrzeit observance", "what to do on yahrzeit",
    "yahrzeit candle", "yahrzeit date", "Hebrew date of death",
    "how to observe yahrzeit", "yahrzeit customs", "yahrzeit meaning",
    // Mourning
    "Jewish mourning", "shiva guide", "Jewish death customs",
    "what happens at a Jewish funeral", "sitting shiva",
  ],
  openGraph: {
    title: "Yahrzeit & Kaddish Guide — Audio, Transliteration & Step-by-Step",
    description: "Need to say Kaddish? Audio, transliteration, and step-by-step guidance. Plus complete yahrzeit observance guide.",
  },
};

export default function YahrzeitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
