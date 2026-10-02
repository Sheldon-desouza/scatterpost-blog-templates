---
title: "Writing for AI assistants: llms.txt, headings and answer-first paragraphs"
description: "How llms.txt, clear headings and answer-first writing help AI chat tools find and quote your blog, with no guarantees attached."
tags: ["llms.txt", "ai-search", "writing"]
date: "2026-09-18"
slug: "writing-for-ai-assistants"
scatterpostId: "demo-writing-for-ai-assistants"
cover: "https://images.unsplash.com/photo-1612367980327-7454a7276aa7?w=1600&q=70&auto=format&fit=crop"
coverAlt: "A white spiral notebook lying open on a brown wooden table."
---

People increasingly ask an AI assistant a question instead of typing it into a search box. The assistant reads several pages, picks out the parts that answer the question, and sometimes names its source. None of this is guaranteed for any particular post, but there are concrete things you can do to make a page easier for an assistant to read and quote correctly, rather than skip over or misquote.

## Answer the question in the first paragraph

Search engines reward keywords; AI assistants reward clarity. When an assistant is summarising your page for a reader, it tends to pull from the first clear statement of the answer, not the lead-up to it. If your post opens with three paragraphs of scene-setting before the actual point, an assistant quoting your page may grab the scene-setting instead of the point, or skip the page for one that answers faster.

Compare these two openings to a post titled "How do I set up a custom domain for my blog":

- Weak: "Choosing a domain is one of the most important decisions a new blogger makes, and there are many options to consider before committing to one."
- Stronger: "To set up a custom domain, buy the domain from a registrar, add a CNAME or A record pointing to your host, then verify it in your hosting dashboard. Each step is below."

The second version gives the assistant (and the human reader) the answer immediately, with detail following. Neither approach is dishonest, but only one is quotable in a single sentence.

## Clear headings do more work than they look like they do

Headings are not just visual structure. Assistants that process a page in sections use headings as a table of contents, deciding which section is relevant to the question asked. A post with one giant unbroken block of text under a single `<h1>` gives an assistant nothing to navigate; a post broken into `<h2>` and `<h3>` sections with descriptive text, not generic labels like "Section 3", gives it a map.

Write headings as if they were the question a reader typed: "How much does Hashnode's Pro plan cost" works better as a heading than "Pricing".

## What llms.txt actually is

`llms.txt` is a plain text file at the root of your domain, similar in spirit to `robots.txt`, that gives AI tools a short, curated index of your most useful pages. It is not a technical standard enforced by any search engine, and no assistant is obliged to read it. It is simply a convention some sites have adopted, and it costs little to add.

A minimal example:

```
# Your Blog Name

> A short blog about building small software products, written by a solo founder.

## Posts

- [How canonical URLs work](https://yoursite.com/canonical-url-explained): why your own site should be the original when you cross-post.
- [A cross-posting checklist](https://yoursite.com/cross-posting-checklist): what Dev.to, Hashnode and LinkedIn each need.

## About

- [About the author](https://yoursite.com/about)
```

Keep it short, keep the descriptions accurate, and update it when you publish something new. An inaccurate `llms.txt` is worse than none at all, since it may point an assistant at a page that no longer matches the description.

## No guarantees, and why that is fine

None of this means an assistant will cite your page, quote it correctly, or even read it at all. AI chat tools change how they crawl and summarise fairly often, and no one outside the companies building them can promise a specific outcome. What these habits do is remove the obvious reasons a page gets skipped: no clear answer near the top, no heading structure, nothing in `llms.txt` pointing to it. That is a reasonable bar to clear, and it also tends to make the post easier for a human skimming it on their phone.

## Where scatterpost fits

scatterpost's optimisation tooling checks for these same things before a post goes out: an answer-first opening paragraph, a sensible heading structure, and a reminder to update `llms.txt` and `llms-full.txt` when a new post is published to your own site. It flags gaps rather than inventing numbers about how often any of this works, because nobody outside the AI labs actually knows that figure yet.

Write for the person asking the question, structure the page so a machine can find the answer quickly, and the rest follows from habit rather than from any one trick.

<p>Photo by <a href="https://unsplash.com/@kellysikkema" target="_blank">Kelly Sikkema</a> on <a href="https://unsplash.com/photos/white-spiral-notebook-on-brown-wooden-table-2q_frVRXWfQ" target="_blank">Unsplash</a>.</p>
