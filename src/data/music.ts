/**
 * The list shown on the Music page, in the order written here (put the
 * newest entries at the top).
 *
 * Each entry needs a `title` and an `artist`. Two fields are optional:
 *   url:  a link to the track or album (Apple Music, Spotify, YouTube, ...)
 *   note: a short line shown under the title
 *
 * Example entry (copy it inside the square brackets below and edit it):
 *
 *   {
 *     title: 'Album or track name',
 *     artist: 'Artist name',
 *     url: 'https://music.apple.com/...',
 *     note: 'Why it is on repeat.',
 *   },
 */

export interface MusicEntry {
	title: string;
	artist: string;
	url?: string;
	note?: string;
}

export const music: MusicEntry[] = [];
