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
    isr: {
      // Cache all pages for 1 hour
      expiration: 3600,
      // Bypass token for manual cache invalidation
      bypassToken: process.env.ISR_BYPASS_TOKEN,
      // Exclude API routes - keep them dynamic for real-time data
      exclude: [
        /^\/api\/.+/,
      ],
    },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
