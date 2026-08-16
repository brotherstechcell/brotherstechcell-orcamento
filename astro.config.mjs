import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const siteUrl = process.env.SITE_URL || 'https://brotherstechcell.vercel.app';

export default defineConfig({
  site: siteUrl,
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/atendimento/') &&
        !page.includes('/404') &&
        !page.includes('/admin') &&
        !page.includes('/dashboard'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/inspiracoes/**', '**/*.mp4'],
      },
    },
  },
});
