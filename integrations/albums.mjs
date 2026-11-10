// @ts-check
/**
 * Album fetcher for the Music page.
 *
 * You keep a plain list of album links in src/data/albums.txt. Each time the
 * preview starts, the site is built, or that file is saved while the preview
 * is running, this step:
 *
 *   1. reads the links
 *   2. asks Apple Music or Spotify for the title, artist and cover of every
 *      album it has not seen before
 *   3. saves the cover into src/assets/albums/ and the details into
 *      src/data/albums.json, which the Music page reads
 *
 * Both outputs are kept in the project, so an album is fetched only once.
 * After that the site builds without contacting Apple or Spotify, and keeps
 * working even if a service later changes or removes its copy of the cover.
 *
 * Do not edit albums.json or the files in src/assets/albums/ by hand: they
 * are rewritten from albums.txt.
 */
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const listFile = new URL('../src/data/albums.txt', import.meta.url);
const dataFile = new URL('../src/data/albums.json', import.meta.url);
const artFolder = new URL('../src/assets/albums/', import.meta.url);

/** A request is abandoned after this long, so a bad connection cannot hang the preview. */
const TIMEOUT_MS = 15_000;

/** The only file names this step creates, and so the only ones it may delete. */
const ART_NAME = /^(apple|spotify)-[A-Za-z0-9]+\.jpg$/;

/**
 * One entry of albums.json.
 *
 * @typedef {object} Album
 * @property {string} key      Unique name, also the cover's file name, e.g. "apple-617154241".
 * @property {string} title
 * @property {string} artist   Empty if the service did not report one.
 * @property {string} url      Where a click on the album goes.
 * @property {string} service  "Apple Music" or "Spotify", used for the link's tooltip.
 */

/**
 * What a link in albums.txt points at.
 *
 * @typedef {object} Link
 * @property {string} key
 * @property {'Apple Music' | 'Spotify'} service
 * @property {string} id       The album's number or code within the service.
 * @property {string} country  Apple Music only: the two-letter store in the link, e.g. "in".
 * @property {string} url      The link without tracking extras.
 */

/**
 * Works out which service and album a pasted link refers to.
 * Returns null for anything that is not an Apple Music or Spotify album link.
 *
 * @param {string} text
 * @returns {Link | null}
 */
function parseLink(text) {
	let url;
	try {
		url = new URL(text);
	} catch {
		return null; // not a web address at all
	}

	// "/in/album/random-access-memories/617154241" -> ['in', 'album', 'random-access-memories', '617154241']
	const parts = url.pathname.split('/').filter(Boolean);

	if (url.hostname === 'music.apple.com' || url.hostname.endsWith('.music.apple.com')) {
		// Apple puts the album number last. A link copied from a song inside
		// an album has the same shape, and "/song/" links are resolved to
		// their album by fetchApple below.
		const id = parts.at(-1) ?? '';
		const isMusic = parts.includes('album') || parts.includes('song');
		if (!isMusic || !/^\d+$/.test(id)) return null;

		const country = /^[a-z]{2}$/.test(parts[0]) ? parts[0] : 'us';
		return {
			key: `apple-${id}`,
			service: 'Apple Music',
			id,
			country,
			url: `https://music.apple.com${url.pathname}`,
		};
	}

	if (url.hostname === 'open.spotify.com') {
		// "/album/CODE", sometimes with a language prefix: "/intl-de/album/CODE".
		const at = parts.indexOf('album');
		const id = at === -1 ? '' : (parts[at + 1] ?? '');
		if (!/^[A-Za-z0-9]+$/.test(id)) return null;

		return {
			key: `spotify-${id}`,
			service: 'Spotify',
			id,
			country: '',
			url: `https://open.spotify.com/album/${id}`,
		};
	}

	return null;
}

/**
 * Fetches a web address, failing on a timeout or an error answer.
 *
 * @param {string} url
 */
async function request(url) {
	const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
	if (!response.ok) throw new Error(`${new URL(url).hostname} answered ${response.status}`);
	return response;
}

/**
 * The details of an album as a service reports them. `artwork` lists cover
 * addresses to try in order, best first.
 *
 * @typedef {{ title: string, artist: string, url: string, artwork: string[] }} Found
 */

/**
 * Looks an album up in Apple's public catalogue search, which needs no account or key.
 *
 * @param {Link} link
 * @returns {Promise<Found>}
 */
async function fetchApple(link) {
	const response = await request(
		`https://itunes.apple.com/lookup?id=${link.id}&country=${link.country}`,
	);
	const result = (await response.json()).results?.[0];
	if (!result?.collectionName || !result.artworkUrl100) {
		throw new Error(`Apple Music has no album for this link in its "${link.country}" store`);
	}

	/** @type {string} */
	const small = result.artworkUrl100;
	return {
		// Apple appends " - EP" and " - Single" to names; the page reads better without.
		title: String(result.collectionName).replace(/ - (EP|Single)$/, ''),
		// A compilation's own artist ("Various Artists") is in collectionArtistName.
		artist: result.collectionArtistName ?? result.artistName ?? '',
		// The catalogue's own address for the album, without the "?uo=4" tracking extra.
		url: String(result.collectionViewUrl ?? link.url).split('?')[0],
		// Apple's image server makes any size on request: the size is the last
		// part of the address, so ".../100x100bb.jpg" becomes ".../600x600bb.jpg".
		artwork: [small.replace(/\/[^/]+$/, '/600x600bb.jpg'), small],
	};
}

/**
 * Looks an album up on Spotify.
 *
 * Title and cover come from Spotify's official "oEmbed" address, which needs
 * no account. It does not include the artist, so that is read from the page
 * Spotify provides for embedding an album. If that page ever changes shape
 * the artist is left empty rather than failing the album.
 *
 * @param {Link} link
 * @returns {Promise<Found>}
 */
async function fetchSpotify(link) {
	const response = await request(
		`https://open.spotify.com/oembed?url=${encodeURIComponent(link.url)}`,
	);
	const data = await response.json();
	if (!data.title || !data.thumbnail_url) throw new Error('Spotify has no album for this link');

	let artist = '';
	try {
		const html = await (await request(`https://open.spotify.com/embed/album/${link.id}`)).text();
		const json = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
		const subtitle = JSON.parse(json ?? '{}').props?.pageProps?.state?.data?.entity?.subtitle;
		if (typeof subtitle === 'string') artist = subtitle;
	} catch {
		// Leave the artist empty; the album still shows with its title and cover.
	}

	/** @type {string} */
	const small = data.thumbnail_url; // 300 px
	// In Spotify's image addresses a fixed code names the size:
	// "ab67616d00001e02" is 300 px and "ab67616d0000b273" is 640 px.
	const large = small.replace('ab67616d00001e02', 'ab67616d0000b273');

	return {
		title: data.title,
		artist,
		url: link.url,
		artwork: large === small ? [small] : [large, small],
	};
}

/**
 * Saves the first cover address that works to `file`.
 *
 * @param {string[]} candidates
 * @param {URL} file
 */
async function downloadArtwork(candidates, file) {
	let failure = new Error('no cover found');
	for (const candidate of candidates) {
		try {
			const response = await request(candidate);
			const type = response.headers.get('content-type') ?? '';
			if (!type.startsWith('image/jpeg')) throw new Error(`the cover is not a JPEG (${type})`);
			await writeFile(file, Buffer.from(await response.arrayBuffer()));
			return;
		} catch (error) {
			failure = error instanceof Error ? error : new Error(String(error));
		}
	}
	throw failure;
}

/** @param {URL} file */
const exists = (file) =>
	stat(file).then(
		() => true,
		() => false,
	);

/**
 * Brings albums.json and the covers in line with albums.txt.
 *
 * A link that cannot be fetched (no connection, a mistyped address) is
 * reported and left out; it never stops the preview or the build, and it is
 * tried again next time.
 *
 * @param {import('astro').AstroIntegrationLogger} logger
 */
async function sync(logger) {
	// No list, nothing to do. This also covers the instant during which some
	// editors remove and re-create a file while saving it.
	const text = await readFile(listFile, 'utf8').catch(() => null);
	if (text === null) return;

	// One link per line. Blank lines and lines starting with # are ignored.
	const lines = text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line !== '' && !line.startsWith('#'));

	/** @type {Album[]} */
	const previous = JSON.parse(await readFile(dataFile, 'utf8').catch(() => '[]'));
	const known = new Map(previous.map((album) => [album.key, album]));

	await mkdir(artFolder, { recursive: true });

	/** @type {Album[]} */
	const albums = [];
	const listed = new Set();

	for (const line of lines) {
		const link = parseLink(line);
		if (!link) {
			logger.warn(`Skipped a line in albums.txt that is not an Apple Music or Spotify album link: ${line}`);
			continue;
		}
		if (listed.has(link.key)) continue; // the same album pasted twice
		listed.add(link.key);

		const artFile = new URL(`${link.key}.jpg`, artFolder);

		// Already fetched on an earlier run: reuse it without going online.
		const saved = known.get(link.key);
		if (saved && (await exists(artFile))) {
			albums.push(saved);
			continue;
		}

		try {
			const found = link.service === 'Spotify' ? await fetchSpotify(link) : await fetchApple(link);
			await downloadArtwork(found.artwork, artFile);
			albums.push({
				key: link.key,
				title: found.title,
				artist: found.artist,
				url: found.url,
				service: link.service,
			});
			logger.info(`Added "${found.title}"${found.artist ? ` by ${found.artist}` : ''}`);
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			logger.warn(`Could not fetch ${line} (${reason}). It is left off the page for now.`);
		}
	}

	// Delete the covers of albums that were removed from the list.
	const keep = new Set(albums.map((album) => `${album.key}.jpg`));
	for (const name of await readdir(artFolder)) {
		if (ART_NAME.test(name) && !keep.has(name)) await rm(new URL(name, artFolder));
	}

	// Rewrite albums.json only when something changed, so the preview does
	// not reload for nothing. Covers are saved above, before this, so they
	// are already in place when the page reloads.
	const json = `${JSON.stringify(albums, null, '\t')}\n`;
	if (json !== (await readFile(dataFile, 'utf8').catch(() => ''))) {
		await writeFile(dataFile, json);
	}
}

/**
 * The Astro integration (a plug-in that runs at set points of the preview
 * and the build). It is switched on in astro.config.mjs.
 *
 * @returns {import('astro').AstroIntegration}
 */
export default function albums() {
	// Runs are chained one after another, so two quick saves of albums.txt
	// cannot write the same files at the same time.
	let queue = Promise.resolve();

	/** @param {import('astro').AstroIntegrationLogger} logger */
	const run = (logger) => {
		queue = queue
			.then(() => sync(logger))
			.catch((error) => logger.error(`Could not update the albums: ${error}`));
		return queue;
	};

	return {
		name: 'albums',
		hooks: {
			// Before the preview or the build starts.
			'astro:config:setup': async ({ command, logger }) => {
				if (command === 'dev' || command === 'build') await run(logger);
			},

			// While the preview is running: again whenever albums.txt is saved.
			'astro:server:setup': ({ server, logger }) => {
				const watched = fileURLToPath(listFile);
				server.watcher.on('all', (event, path) => {
					if ((event === 'add' || event === 'change') && resolve(path) === watched) run(logger);
				});
			},
		},
	};
}
