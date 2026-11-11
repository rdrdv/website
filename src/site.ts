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
 * The sections of the site, in the order they appear in the menu.
 *
 * To switch a section off, change its `enabled` from true to false.
 * A section that is off:
 *   - disappears from the menu and from the home page
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
 * Menu entries, built from the list above. Each inner array is one group;
 * groups are separated by a thin line in the menu. A group with nothing in
 * it (every section switched off) is left out.
 */
export const nav = [[{ label: 'Home', href: '/' }], enabledSections].filter(
	(group) => group.length > 0,
);
