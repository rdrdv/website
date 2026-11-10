// @ts-check
import { rm } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { sections } from './src/site.ts';

/**
 * The addresses of the sections switched off in src/site.ts, e.g. ['/photography/'].
 * Only simple one-folder addresses are accepted, so the clean-up step below
 * can never touch anything except a section's own folder.
 */
const disabledPaths = Object.values(sections)
	.filter((section) => !section.enabled)
	.map((section) => section.href)
	.filter((href) => /^\/[a-z0-9-]+\/$/.test(href));

/** True when a full address such as https://rdrdv.com/photography/ is inside a switched-off section. */
const isDisabled = (/** @type {string} */ url) =>
	disabledPaths.some((path) => new URL(url).pathname.startsWith(path));

/**
 * A small Astro integration (a plug-in that runs at set points of the build).
 * After the site is built into dist/, it deletes the folder of every
 * switched-off section, so those pages are not published. The web host then
 * answers their addresses with the "Page not found" page.
 *
 * @type {import('astro').AstroIntegration}
 */
const removeDisabledSections = {
	name: 'remove-disabled-sections',
	hooks: {
		'astro:build:done': async ({ dir }) => {
			for (const path of disabledPaths) {
				// `dir` is the dist/ folder; "./photography/" is resolved inside it.
				await rm(new URL(`.${path}`, dir), { recursive: true, force: true });
			}
		},
	},
};

// https://astro.build/config
export default defineConfig({
	// The public address of the site. Astro uses it to build absolute URLs
	// for the RSS feed, the sitemap and the canonical link on every page.
	site: 'https://rdrdv.com',

	integrations: [
		// Generates sitemap-index.xml at build time so search engines can find
		// every page. Switched-off sections are left out of it.
		sitemap({ filter: (page) => !isDisabled(page) }),
		removeDisabledSections,
	],

	markdown: {
		shikiConfig: {
			// Code blocks in posts get two colour sets, one per mode.
			// The switch between them is in src/styles/global.css.
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
		},
	},
});
