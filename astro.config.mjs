// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Custom domain served via GitHub Pages (see public/CNAME).
  // No `base` is set because the site is served from the domain root.
  site: 'https://aaron-schweig.de',
  // Static Site Generation is Astro's default output; pages are prerendered to HTML.
  output: 'static',
  // Emit clean, directory-style URLs (e.g. /impressum/ instead of /impressum.html).
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
