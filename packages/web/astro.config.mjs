// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://claude-plugins.dev',
  integrations: [
    react(),
  ],
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    maxDuration: 60,
    // ISR removed - using edge caching with manual Cache-Control headers
  }),
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['react-tweet']
    }
  },
});
