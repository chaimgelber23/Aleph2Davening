import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Learn to Daven — Jewish Prayer Guide with Audio & Transliteration",
  description:
    "Learn to daven from scratch — even if you can't read Hebrew. Interactive siddur with audio for every prayer, transliteration, English translation, and step-by-step coaching. Covers Modeh Ani, Shema, Amidah, and complete weekday & Shabbat services.",
  keywords: [
    // Core intent
    "learn to daven", "how to daven", "davening for beginners", "beginner davening guide",
    "learn to daven from scratch", "learn to daven quickly", "learn to daven faster",
    "I want to learn to daven", "teach me to daven", "daven for the first time",
    "how to daven if you don't know Hebrew", "daven without knowing Hebrew",
    // Siddur / prayer book
    "siddur with transliteration", "siddur audio", "siddur in English",
    "siddur for beginners", "online siddur", "digital siddur", "interactive siddur",
    "siddur with English translation", "siddur with pronunciation",
    // How to pray
    "Jewish prayer guide", "how to pray Jewish", "Jewish prayer for beginners",
    "learn Jewish prayers English", "Jewish prayers with pronunciation",
    "how to follow along in shul", "what to say in synagogue",
    // Specific prayers
    "modeh ani prayer", "shema prayer", "amidah guide", "shemoneh esrei",
    "ashrei prayer", "aleinu prayer", "morning brachot",
    // Services
    "shacharit guide", "mincha guide", "maariv guide",
    "weekday prayer service", "shabbat prayer service", "shabbos davening",
    // Improvement
    "improve my davening", "daven better", "daven with more kavana",
    "speed up davening", "keep up in shul", "follow along in services",
    // Baal teshuva / convert
    "baal teshuva davening", "new to davening", "just started davening",
    "convert learn to pray", "adult learning to daven",
    // Features
    "prayer with transliteration", "Hebrew prayer audio", "prayer coaching",
    "learn prayers step by step", "prayer with English and Hebrew",
  ],
  openGraph: {
    title: "Learn to Daven — Jewish Prayer Guide with Audio",
    description: "Learn to daven from scratch with audio, transliteration, and step-by-step coaching for every Jewish prayer — even if you can't read Hebrew yet.",
  },
};

export default function DavenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
