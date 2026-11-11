import { getCollection } from 'astro:content';

/**
 * Returns all blog posts: pinned posts first, then the rest, newest first.
 *
 * Drafts (posts with `draft: true`) are included while running `npm run dev`
 * so you can preview them, and excluded from `npm run build`, which produces
 * the published site.
 */
export async function getPosts() {
	const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort((a, b) => {
		// A pinned post always goes above a post that is not pinned.
		if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
		// Otherwise newest first. A post without a date counts as the oldest.
		return (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0);
	});
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
