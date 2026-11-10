/**
 * Site-wide settings. Edit this file to change your name, the description
 * search engines show, your social links, and which sections are switched on.
 */

export const site = {
	/** Shown as the home page heading and in every browser tab title. */
	name: 'Rudra Dave',

	/** Default description for search results and link previews. */
	description: 'Personal website of Rudra Dave: writing, photography and music.',

	/**
	 * Links shown under the bio on the home page.
	 * An entry with an empty `href` is skipped, so fill in the ones you want.
	 */
	links: [
		{ label: 'X', href: '' },
		{ label: 'LinkedIn', href: '' },
		{ label: 'GitHub', href: 'https://github.com/rdrdv' },
	],
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
	photography: { label: 'Photography', href: '/photography/', enabled: true },
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
