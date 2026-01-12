import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'YouTube Comment Bot',
    short_name: 'YT Bot',
    description: 'Automate YouTube comments with AI-powered responses',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#FF0000',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
