---
title: Hello, world
description: A sample post that shows how writing on this site works.
date: 2026-11-10
draft: true
---

This is a sample post. It is marked `draft: true`, so it appears while you preview the site on your Mac and is left out of the published site. Delete this file once you have written your first post.

## How to write a post

Create a new `.md` file in `src/content/writing`. The file name becomes the address: `my-first-post.md` is published at `/writing/my-first-post/`.

Start the file with a block like the one at the top of this file:

- `title` is required.
- `date` is required, written as `YYYY-MM-DD`.
- `description` is optional. It is used for search results and the RSS feed.
- `draft` is optional. Set it to `true` to keep a post unpublished.

## Formatting

The body is written in Markdown. You can use **bold**, *italics*, [links](https://rdrdv.com), lists, and quotes:

> A quote looks like this.

Code blocks are highlighted:

```python
def greet(name: str) -> str:
    return f"Hello, {name}"
```
