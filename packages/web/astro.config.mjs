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
      expiration: 21600, // 6 hours
      bypassToken: process.env.ISR_BYPASS_TOKEN,
      exclude: [
        /^\/api\/.+/,
        /^\/$/,
        /^\/skills$/,
      ],
    },
    rewrites: [
      {
        source: '/(.*)',
        has: [{ type: 'host', value: 'api2.claude-plugins.dev' }],
        destination: 'https://kamalnrf--44867e10a75311f08f880224a6c84d84.web.val.run/$1',
      },
    ],
  }),
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['react-tweet']
    }
  },
});
