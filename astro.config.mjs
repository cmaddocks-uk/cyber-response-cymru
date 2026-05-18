import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// Site config — used by Astro for absolute URLs (sitemaps, canonicals, og:url).
// Change `site` if you fork to a different repo / domain.
//
// `base` is the path the site is served from. For GitHub Pages project sites
// (https://USER.github.io/REPO) this MUST match the repo name with a leading
// slash, e.g. '/cyber-response'. For a custom domain or a user/org site, set
// base: '/'.
const SITE = 'https://cmaddocks-uk.github.io';
const BASE = '/cyber-response-cymru';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  output: 'static',
  build: {
    // Emit assets under /assets/ so they sit cleanly inside the base path.
    assets: 'assets',
  },
  integrations: [
    react(),
    tailwind({
      // Disable injecting Tailwind's base reset into every page; we control
      // it via src/styles/global.css so we can add a few custom layers.
      applyBaseStyles: false,
    }),
  ],
  vite: {
    // Force a single React + ReactDOM instance across the whole module graph.
    // Without this, Vite's optimised-deps cache can produce two copies after
    // certain devDep installs and React explodes with "Invalid hook call".
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  },
});
