import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * A "content collection" is a folder of files that Astro reads and validates.
 * Every Markdown file in src/content/writing becomes one blog post.
 *
 * The schema below describes the frontmatter (the block between the `---`
 * lines at the top of each post). If a post is missing a required field,
 * the build fails with a clear message instead of publishing a broken page.
 */
const writing = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
	schema: z.object({
		/** Post title, shown in the list and at the top of the post. */
		title: z.string(),
		/** Optional one-line summary, used for search results and the RSS feed. */
		description: z.string().optional(),
		/** Publication date, written as YYYY-MM-DD. Leave it out to show no date. */
		date: z.coerce.date().optional(),
		/** Pinned posts stay at the top of the Writing list, above every other post. */
		pinned: z.boolean().default(false),
		/** Drafts show up while developing but are left out of the published site. */
		draft: z.boolean().default(false),
	}),
});

export const collections = { writing };
