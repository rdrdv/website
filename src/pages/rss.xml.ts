import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';
import { site } from '../site';

/**
 * Builds /rss.xml, a machine-readable list of posts.
 * Feed readers check this file to show subscribers your new posts.
 */
export async function GET(context: APIContext) {
	const posts = await getPosts();

	return rss({
		title: site.name,
		description: site.description,
		// `context.site` is the `site` value from astro.config.mjs.
		site: context.site ?? 'https://rdrdv.com',
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			link: `/writing/${post.id}/`,
		})),
	});
}
