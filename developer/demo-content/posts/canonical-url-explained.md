---
title: "What a canonical URL is, and why it should point to your own site"
description: "A plain-English guide to canonical URLs and why your own blog should be the original copy whenever you cross-post."
tags: ["seo", "canonical", "blogging"]
date: "2026-09-11"
slug: "canonical-url-explained"
scatterpostId: "demo-canonical-url-explained"
cover: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600&q=70&auto=format&fit=crop"
coverAlt: "A hand typing on a MacBook Pro keyboard on a plain desk."
---

A canonical URL is a single line of HTML that tells search engines and AI crawlers: "this page is the original, treat any copies elsewhere as duplicates of this one." It lives in the `<head>` of a page as `<link rel="canonical" href="https://yoursite.com/post">`. Nothing more mysterious than that, but it decides who gets credit for a piece of writing that ends up on five different platforms.

## Why this matters once you cross-post

Say you write a post on your own blog, then also publish it to Dev.to, Hashnode and LinkedIn to reach people who already live on those platforms. Search engines now see the same text in four places. Without a canonical tag, they have to guess which one is the source, and search engines are not always kind to the guess. They might rank the Dev.to copy above your own site, simply because Dev.to has a stronger domain. You did the work, somebody else's domain gets the click.

A canonical tag removes the guessing. Dev.to and Hashnode both support a canonical URL field when you publish, and when you fill it in with a link back to your own post, you are telling every crawler: the real one lives here, this is a mirror. The ranking signals, the backlink value and the long-term traffic should accumulate on your own domain, not scatter across platforms you do not own.

## The founder mistake this avoids

A common pattern among busy founders is to write first wherever is fastest: LinkedIn, Twitter, or a quick Dev.to post, because it is one click from idea to publish. The founder's own blog gets the leftovers, posted days later if at all, and sometimes just a copy-paste of the same text with no canonical link pointing anywhere. Over months, this means the founder's own site builds almost no authority, while all the traffic and backlinks pile up on platforms they do not control. If LinkedIn changes its algorithm, or Dev.to deprioritises external links, there is no fallback: the founder's own domain was never the one growing.

Publishing to your own site first and only then cross-posting keeps the order right. Your site gets the earliest version, the canonical tag on every copy points home, and your domain is the one compounding in search results over time.

## What to check on each platform

Not every platform calls it the same thing, and not all of them let you set it:

| Platform | Field name | Where it lives |
|---|---|---|
| Dev.to | Canonical URL | Article settings, under the post editor |
| Hashnode | Canonical URL | Post settings panel |
| Your own blog (Next.js, Ghost, WordPress) | `rel="canonical"` meta tag | Set in the page template, usually automatic |
| LinkedIn | No canonical field | Short-form only; link back in the text instead |
| Medium | Set via the Import tool | Importing from your URL sets it automatically |

If a platform has no canonical field at all, the next best thing is a plain link back to the original post near the top of the text, so a reader (and, increasingly, an AI assistant summarising the page) can still find the source.

## A quick way to check your own site

Open any published post, view the page source, and search for `rel="canonical"`. If it is missing, or it points to the wrong URL, fix the page template rather than each individual post: canonical tags are almost always generated from the page's own URL, so one template fix corrects every post at once.

## Where scatterpost fits

This is the one rule scatterpost is built around: it publishes to your own website first, captures the URL your site returns, and only then cross-posts to Dev.to, Hashnode, LinkedIn, Bluesky and Mastodon with that URL filled into the canonical field automatically. The order is fixed on purpose, because "whichever platform published first becomes canonical" is the mistake this whole approach exists to avoid.

Whether or not you use a tool for it, the underlying habit is the same: write once, publish home first, point every other copy back to it. Your blog is the only place on the internet you fully control. Treat it as the original and everything else as advertising for it.

<p>Photo by <a href="https://unsplash.com/@glenncarstenspeters" target="_blank">Glenn Carstens-Peters</a> on <a href="https://unsplash.com/photos/person-using-macbook-pro-npxXWgQ33ZQ" target="_blank">Unsplash</a>.</p>
