import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aleph2davening.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    // Home
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },

    // Hebrew Learning
    { url: `${SITE_URL}/hebrew`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/hebrew/bootcamp`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/hebrew/letters`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/hebrew/vowels`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/hebrew/practice`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },

    // Davening
    { url: `${SITE_URL}/daven`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },

    // Yahrzeit
    { url: `${SITE_URL}/yahrzeit`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },

    // Jewish Living
    { url: `${SITE_URL}/living`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ];
}
