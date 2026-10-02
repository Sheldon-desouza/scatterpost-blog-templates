---
title: "A practical cross-posting checklist: Dev.to, Hashnode and LinkedIn"
description: "What each platform actually needs before you cross-post: formatting, images, canonical fields and length limits, in one checklist."
tags: ["cross-posting", "devto", "hashnode", "linkedin"]
date: "2026-09-15"
slug: "cross-posting-checklist"
scatterpostId: "demo-cross-posting-checklist"
cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=70&auto=format&fit=crop"
coverAlt: "A laptop open on a glass-top desk showing a chart."
---

Every platform asks for roughly the same article but wants it shaped slightly differently. Get the shape wrong and the post looks fine but reads oddly: a broken image, a missing cover, a wall of text with no line breaks. Here is what to check before you hit publish on each one.

## Dev.to

Dev.to takes Markdown directly, so most posts move across with almost no changes.

- **Front matter.** Dev.to expects a small front matter block at the top: `title`, `published`, `tags` (up to four, lower case, no spaces), and `canonical_url`. Miss the canonical field and the post counts as a duplicate rather than a syndicated copy.
- **Cover image.** Set `cover_image` to a URL, ideally at least 1000px wide. Dev.to crops it into a banner, so avoid images with important text near the edges.
- **Code blocks.** Triple backticks with a language name (` ```typescript `) get syntax highlighting automatically. Plain backticks without a language still work but render flat.
- **Tags.** Dev.to tags are a discovery mechanism, not a copy of your blog's categories. Pick ones with existing activity (`webdev`, `javascript`, `beginners`) rather than something highly specific nobody searches.
- **Rate limit to know about.** Article creation is limited to 10 requests per 30 seconds, which only matters if you are publishing through the API in bulk. A single manual post is never affected.

## Hashnode

Hashnode is also Markdown-first but has a few of its own quirks.

- **Canonical field.** Called `originalArticleURL` if you are using the API, and just "Canonical URL" in the editor under post settings.
- **Cover image.** Hashnode calls it `coverImage` and shows it full-width at the top of the post, so a wide image (at least 1600px) looks noticeably sharper than a square one.
- **Publication requirement.** If you are publishing under a custom domain or a team publication rather than your personal Hashnode blog, some publishing features need a paid Hashnode plan. Worth checking before you assume a feature is available.
- **Series.** If this post is part of a sequence, Hashnode's "series" feature groups them with next/previous links, which Dev.to does not offer natively.

## LinkedIn

LinkedIn is the odd one out: it has no canonical field and no Markdown support at all.

- **Plain text only.** Headings, bold and bullet lists in Markdown do not render; LinkedIn strips the formatting characters and leaves them visible as literal asterisks or hashes. Rewrite headings as short standalone lines instead.
- **Character limit.** Long-form posts cut off around 3,000 characters, with a "see more" link. Put your best sentence in the first two lines, since that is all that shows before the reader has to click.
- **Link back manually.** Since there is no canonical field, put the original post's URL near the top or bottom of the text, written out in full. A link in the first line can also suppress reach, so many people place it at the end instead.
- **Images.** A single image attaches cleanly; LinkedIn resizes it automatically, so a cover image from your blog usually works without edits.

## A five-minute pre-publish check

Run through this before sending the same article to all three:

1. Does the canonical field (Dev.to and Hashnode) point to your own domain, not to a draft or staging URL?
2. Is the cover image wide enough that it is not blurry when cropped?
3. On LinkedIn, have you rewritten any heading or bullet-heavy intro as plain sentences?
4. Are tags relevant to each platform's own audience, not just copied from your blog's categories?
5. Does the post read correctly if someone only sees the first two or three lines?

## Where scatterpost fits

This is the kind of reformatting scatterpost's adapters handle automatically: it keeps Markdown for Dev.to and Hashnode, strips formatting and trims length for LinkedIn, sets each platform's canonical field to your own site's URL, and carries the cover image across in the shape each platform expects. You can still do all of this by hand; the checklist above is exactly what the tool is checking on your behalf.

None of this is complicated once it is written down. The failure mode is forgetting one small field under time pressure, publishing the same text everywhere, and noticing a week later that the canonical tag was never set.

<p>Photo by <a href="https://unsplash.com/@kmuza" target="_blank">Carlos Muza</a> on <a href="https://unsplash.com/photos/laptop-computer-on-glass-top-table-hpjSkU2UYSU" target="_blank">Unsplash</a>.</p>
