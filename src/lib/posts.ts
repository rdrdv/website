import { getCollection } from 'astro:content';

/**
 * Returns all blog posts, newest first.
 *
 * Drafts (posts with `draft: true`) are included while running `npm run dev`
 * so you can preview them, and excluded from `npm run build`, which produces
 * the published site.
 */
export async function getPosts() {
	const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Formats a date as "10 Nov 2026".
 * The time zone is fixed to UTC so a date written as 2026-11-10 in a post
 * never shifts to the previous or next day on the build machine.
 */
export function formatDate(date: Date) {
	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC',
	});
}
