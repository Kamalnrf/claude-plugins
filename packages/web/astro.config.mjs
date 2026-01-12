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
      // Cache individual pages for 1 hour (skill detail pages)
      expiration: 3600,
      // Bypass token for manual cache invalidation
      bypassToken: process.env.ISR_BYPASS_TOKEN,
      // Exclude routes that don't work with ISR:
      exclude: [
        /^\/api\/.+/,     // API routes - keep dynamic for real-time data
        /^\/$/,           // Homepage - uses query params (q, hasSkills, orderBy, order)
        /^\/skills$/,     // Skills index - uses query params (q, orderBy, order)
        // Note: /skills/[owner]/[repo]/[skill] IS cached (path-based, no query params)
      ],
    },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
