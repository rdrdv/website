# rdrdv.com

Personal website of Rudra Dave, built with [Astro](https://astro.build). Astro turns the files in this folder into plain HTML and CSS, so the published site is fast and needs no server.

## Commands

Run these in Terminal from this folder.

| Command           | What it does                                                        |
| :---------------- | :------------------------------------------------------------------ |
| `npm run dev`     | Starts a live preview at `http://localhost:4321`. Drafts are shown. |
| `npm run build`   | Builds the published site into `dist/`. Drafts are left out.        |
| `npm run preview` | Serves the built `dist/` folder, to check it before publishing.     |

## Everyday edits

| To change                 | Edit                                                             |
| :------------------------ | :--------------------------------------------------------------- |
| Name, social links        | `src/site.ts`                                                    |
| Switch a section on/off   | `src/site.ts`, the `enabled: true` / `false` value in `sections` |
| Home page bio             | `src/pages/index.astro`                                          |
| Portrait on the home page | Add `src/assets/portrait.jpg` (png, webp and avif also work)     |
| Blog posts                | Add a `.md` file to `src/content/writing`                        |
| Photographs               | Drop image files into `src/assets/photos`                        |
| Albums on the Music page  | Paste album links into `src/data/albums.txt`                     |
| Colours, fonts, spacing   | `src/styles/global.css`                                          |

### Switching a section off

In `src/site.ts`, change a section's `enabled` from `true` to `false`:

```ts
photography: { label: 'Photography', href: '/photography/', enabled: false },
```

The section leaves the menu and the home page, and its page is not published. Its files stay where they are, so changing the value back to `true` restores it.

### Light and dark mode

The site follows the appearance set on the visitor's device. Both colour sets are at the top of `src/styles/global.css`: the first `:root` block holds the light colours, and the `@media (prefers-color-scheme: dark)` block under it holds the dark ones. When you change a colour, change it in both blocks.

### Writing a post

Create `src/content/writing/my-post.md`. It is published at `/writing/my-post/`.

```md
---
title: My post
description: Optional one-line summary.
date: 2026-11-10
draft: false
---

The post, written in Markdown.
```

Set `draft: true` to keep a post out of the published site while you work on it.

### Adding photographs

Drop JPG, PNG, WebP or AVIF files into `src/assets/photos`. They are sorted by file name with the last name first, so names that start with a date (`2026-11-10-marine-drive.jpg`) put the newest photo at the top. The rest of the file name becomes the photo's description for screen readers.

Export photos at about 3000 px on the long edge. Astro creates the smaller versions visitors download, and originals larger than that only make the project folder heavier.

### Adding albums

Open `src/data/albums.txt` and paste one album link per line, from Apple Music (Share > Copy Link) or Spotify (Share > Copy Album Link). The site fetches the title, artist and cover from the link, and a click on the album opens that link. Albums appear in the order of the lines; delete a line to remove an album.

The fetch happens when `npm run dev` or `npm run build` starts, and again each time `albums.txt` is saved while the preview is running. The results are stored in `src/data/albums.json` and `src/assets/albums/`, so each album is fetched only once. Both are written by the site: do not edit them by hand, but do keep them in the project.

A link that cannot be fetched is named in the Terminal window and left off the page until it works.

## Structure

```text
integrations/        Build steps (the album fetcher)
public/              Files copied to the site as they are (icons)
src/
  assets/            Images that Astro optimises (portrait, photos, album covers)
  components/        Reusable pieces (the menu)
  content/writing/   Blog posts in Markdown
  data/albums.txt    The album links for the Music page
  layouts/Base.astro The shell shared by every page
  pages/             One file per page; the file path is the address
  styles/global.css  Colours, typography and shared styles
  site.ts            Name, links and menu entries
```
