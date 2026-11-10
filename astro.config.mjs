// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	// The public address of the site. Astro uses it to build absolute URLs
	// for the RSS feed, the sitemap and the canonical link on every page.
	site: 'https://rdrdv.com',

	// Generates sitemap-index.xml at build time so search engines can find every page.
	integrations: [sitemap()],
});
