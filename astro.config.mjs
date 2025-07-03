// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  server: {
    allowedHosts: ['localhost', process.env.PUBLIC_SITE_URL || 'wumtodo.example.com'],
  },
  adapter: cloudflare(),
  integrations: [svelte(), tailwind()],
});
