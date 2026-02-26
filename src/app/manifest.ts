import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aleph2Daven — Hebrew, Davening & Jewish Living',
    short_name: 'Aleph2Daven',
    description:
      'Learn Hebrew, master davening, and navigate Jewish daily life.',
    start_url: '/',
    display: 'standalone',
    background_color: 'var(--background)',
    theme_color: 'var(--primary)',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
