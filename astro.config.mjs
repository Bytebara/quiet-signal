// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { rehypeBaseLinks } from './src/lib/rehype-base-links.mjs';

// GitHub Pages settings.
// - SITE_URL: the public address, e.g. https://your-alias.github.io
// - SITE_BASE: "/" if the repo is named <alias>.github.io,
//              otherwise "/<repo-name>/" (for example "/quiet-signal/").
// Both are set in .github/workflows/deploy.yml, so you rarely touch this file.
const site = process.env.SITE_URL || 'https://example.github.io';
const base = process.env.SITE_BASE || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: process.env.FLAT_FILES ? 'ignore' : 'always',
  build: {
    // Keep CSS in separate files so the Content-Security-Policy can forbid inline styles.
    inlineStylesheets: 'never',
    format: process.env.FLAT_FILES ? 'file' : 'directory',
  },
  vite: {
    build: {
      // Never inline assets or scripts as data: URIs; everything is a same-origin file.
      assetsInlineLimit: 0,
    },
  },
  markdown: {
    // Prism adds CSS classes to code; the default (Shiki) uses inline style="" attributes,
    // which the site's Content-Security-Policy blocks. Colors live in global.css.
    syntaxHighlight: 'prism',
    processor: unified({ rehypePlugins: [rehypeBaseLinks(base)] }),
  },
  // No integrations: no analytics, no sitemap pings, nothing that phones home.
});
