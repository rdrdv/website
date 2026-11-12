/**
 * Site-wide settings. Edit this file to change your name, the description
 * search engines show, your contact links, and which sections are switched on.
 */

export const site = {
	/** Your full name: the title search engines show, and part of every browser tab title. */
	name: 'Rudra Dave',

	/** Default description for search results and link previews. */
	description: 'Personal website of Rudra Dave: writing, photography and music.',

	/**
	 * Where the three links in the last line of the home page go:
	 * "Say hello, fork my code, or share my tweets."
	 */
	contact: {
		/** "hello" opens a new email addressed to this. */
		email: 'hello@rdrdv.com',
		/** "code" opens this page. */
		github: 'https://github.com/rdrdv',
		/** "tweets" opens this page. */
		twitter: 'https://x.com/rdrdv',
	},
};

/**
 * The sections of the site, in the order a visitor scrolls through them
 * after the home page. Move a line up or down to change that order.
 *
 * To switch a section off, change its `enabled` from true to false.
 * A section that is off:
 *   - is skipped when scrolling from page to page
 *   - is not published (its address shows the "Page not found" page)
 *   - keeps all its files, so changing false back to true restores it
 */
export const sections = {
	writing: { label: 'Writing', href: '/writing/', enabled: true },
	photography: { label: 'Photography', href: '/photography/', enabled: false },
	music: { label: 'Music', href: '/music/', enabled: true },
};

/** Only the sections that are switched on. */
export const enabledSections = Object.values(sections).filter((section) => section.enabled);

/**
 * The pages a visitor moves through by scrolling, from top to bottom:
 * the home page first, then each section that is switched on.
 */
export const pageOrder = [{ label: 'Home', href: '/' }, ...enabledSections];
