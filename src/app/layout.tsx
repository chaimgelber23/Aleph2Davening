import type { Metadata, Viewport } from "next";
import { Inter, Noto_Serif_Hebrew, Noto_Sans_Hebrew, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/components/AuthProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const notoSerifHebrew = Noto_Serif_Hebrew({
  variable: "--font-hebrew-serif",
  subsets: ["hebrew"],
  weight: ["400", "700"],
});

const notoSansHebrew = Noto_Sans_Hebrew({
  variable: "--font-hebrew-sans",
  subsets: ["hebrew"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aleph2davening.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Aleph2Davening — Learn Hebrew, Daven & Jewish Living",
    template: "%s | Aleph2Davening",
  },
  description:
    "Free app to learn the Hebrew alphabet, read with vowels (nikud), master Jewish prayers with audio, transliteration & coaching. From Aleph-Bet to leading the amud — at your own pace, even with zero Hebrew.",
  keywords: [
    // Hebrew
    "learn Hebrew", "learn Hebrew alphabet", "learn to read Hebrew", "Hebrew for beginners",
    "aleph bet", "Hebrew letters", "Hebrew vowels", "nikud",
    "Hebrew reading practice", "Hebrew learning app",
    // Davening
    "learn to daven", "how to daven", "davening for beginners", "beginner davening",
    "Jewish prayer", "siddur", "siddur with transliteration", "siddur audio",
    "learn Jewish prayers", "how to follow along in shul",
    // Specific prayers
    "modeh ani", "shema", "amidah", "shemoneh esrei",
    // Yahrzeit / Kaddish
    "yahrzeit", "kaddish", "mourner's kaddish", "how to say kaddish",
    "kaddish transliteration", "kaddish audio",
    // Living
    "brachot", "Jewish blessings", "bracha", "Jewish daily living",
    // People
    "baal teshuva", "new to Judaism", "Jewish convert",
  ],
  authors: [{ name: "Aleph2Davening" }],
  creator: "Aleph2Davening",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Aleph2Davening",
    title: "Aleph2Davening — Learn Hebrew, Daven & Jewish Living",
    description: "Free app to learn the Hebrew alphabet, read with vowels, and master Jewish prayers with audio, transliteration & step-by-step coaching.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aleph2Davening — Learn Hebrew, Daven & Jewish Living",
    description: "Free app to learn the Hebrew alphabet, read with vowels, and master Jewish prayers with audio, transliteration & step-by-step coaching.",
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "education",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: 'var(--primary)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${inter.variable}
          ${playfair.variable}
          ${notoSerifHebrew.variable}
          ${notoSansHebrew.variable}
          font-sans antialiased bg-[#FAF9F6] text-foreground min-h-screen
        `}
      >
        <JsonLd />
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
