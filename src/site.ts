/**
 * Site-wide settings. Edit this file to change your name, the description
 * search engines show, your social links and the entries in the menu.
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
 * Menu entries. Each inner array is one group; groups are separated by a
 * thin line in the menu. To add a page, create it in src/pages and add it here.
 */
export const nav = [
	[{ label: 'Home', href: '/' }],
	[
		{ label: 'Writing', href: '/writing/' },
		{ label: 'Photography', href: '/photography/' },
		{ label: 'Music', href: '/music/' },
	],
];
