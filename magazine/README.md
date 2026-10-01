# Magazine

An editorial, card-grid Next.js blog for a product or marketing
founder: a large featured post up top, then a responsive grid of cards
with cover images, descriptions, dates and tags, plus `/tags/[tag]`
collection pages. Built to connect straight to
[scatterpost](https://scatterpost.io) as a Website channel. It has no
runtime dependency on any scatterpost package: the signature
verification, payload validation and content stores it needs are
self-contained under `src/lib/scatterpost/` (synced from this
repository's `shared/` folder by `scripts/sync-shared.mjs`), so this
folder works if it is copied out on its own.

## Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSheldon-desouza%2Fscatterpost-blog-templates%2Ftree%2Fmain%2Fmagazine&project-name=my-blog&repository-name=my-blog&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D&env=NEXT_PUBLIC_SITE_URL,SCATTERPOST_WEBHOOK_SECRET)

The button clones this one folder into its own repository, provisions a
private Vercel Blob store for it, and prompts for the two environment
variables push mode needs (`NEXT_PUBLIC_SITE_URL`,
`SCATTERPOST_WEBHOOK_SECRET`). If you clone the whole
`scatterpost-blog-templates` repository yourself instead, set the
project's "Root Directory" to `magazine`.

Pull mode needs a few more variables; see the table below and set them
after the first deploy, or add them to the `env` list yourself before
clicking the button.

## Environment variables

See `.env.example` for the full list with comments. In short:

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | always | Public base URL of this deployment. |
| `SITE_NAME`, `AUTHOR_NAME`, `AUTHOR_URL` | always (optional) | Used in titles, Open Graph, Twitter cards and the JSON-LD on every page. Sensible defaults apply if unset. |
| `SCATTERPOST_WEBHOOK_SECRET` | push mode | Verifies `X-Scatterpost-Signature`. Minimum 32 characters, same value entered in scatterpost's channel form. |
| `SCATTERPOST_API_KEY` | pull mode | An `sp_live_...` key, scoped to your workspace. |
| `SCATTERPOST_API_URL` | pull mode | Base URL of the scatterpost API. |
| `CRON_SECRET` | pull mode | Checked on `/api/scatterpost/pull`; Vercel sets its value as the `Authorization` header automatically on the scheduled call in `vercel.json`. |
| `CONTENT_STORE` | always (optional) | `blob`, `file` or `supabase`. Defaults to `blob` when `BLOB_READ_WRITE_TOKEN` is set (which the Deploy button's Blob store does automatically), otherwise `file`. |
| `BLOB_READ_WRITE_TOKEN` | `CONTENT_STORE=blob` | Set automatically when a Blob store is connected to the project. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | `CONTENT_STORE=supabase` only | Run `supabase/posts.sql` once against that project first. |

If you are only using push mode, you can remove the `crons` block from
`vercel.json`; it is harmless left in (the route just returns a 500 until
`SCATTERPOST_API_URL`/`SCATTERPOST_API_KEY` are set), but it is one fewer
thing to explain.

## Connecting this site as a Website channel

Push mode (scatterpost calls this site, the default and simplest option):

1. Deploy this site and set `NEXT_PUBLIC_SITE_URL` and
   `SCATTERPOST_WEBHOOK_SECRET`.
2. In scatterpost, add a channel with `platform: "website"` and:
   ```json
   {
     "endpointUrl": "https://your-site.example.com/api/scatterpost",
     "secret": "<the same SCATTERPOST_WEBHOOK_SECRET value>",
     "mode": "push"
   }
   ```
3. Publish an article to that channel. scatterpost signs the request
   with `secret` and POSTs it to `endpointUrl`; this site verifies the
   signature, writes the post, revalidates every page that shows it
   (including every `/tags/[tag]` page a post's tags touch), and
   replies `{ "url": "..." }`.

Pull mode (this site polls scatterpost instead of receiving a webhook):

1. Deploy this site and set `NEXT_PUBLIC_SITE_URL`,
   `SCATTERPOST_API_URL`, `SCATTERPOST_API_KEY` and `CRON_SECRET`.
2. In scatterpost, add a channel with `platform: "website"` and
   `"mode": "pull"`.
3. Either let `vercel.json`'s cron call `/api/scatterpost/pull` every ten
   minutes, or run `npm run pull` (`scripts/pull.mjs`) yourself on a
   schedule of your own.

## How the canonical flows

Whichever mode you use, this site's own URL for a post becomes the
canonical for every cross-post scatterpost makes afterwards (Dev.to,
Hashnode, LinkedIn, and so on always carry a `canonicalUrl` pointing back
here, never the other way round). Every post page also sets its own
`<link rel="canonical">` to `post.canonical` (falling back to this
site's own URL for a post that has not gone through scatterpost, such as
one you write by hand in `content/posts/`), so the tag on the page
always agrees with what scatterpost recorded.

## The card grid, cover images and tags

- The home page shows the latest post as a large featured card, then a
  grid of the next eight.
- A post's cover comes from `coverImageUrl` on the scatterpost payload
  (the `cover` front matter field for a hand-written post). A post with
  no cover gets a generated gradient placeholder with the title over it
  (`src/lib/cover-placeholder.ts`), derived deterministically from the
  title, so the grid never shows a broken image.
- Cover images render as a plain `<img>`, not `next/image`: a cover's
  host is whatever the founder's own pipeline stores it on, not a fixed
  list this template could put in `next.config.ts`'s
  `images.remotePatterns`, and a wildcard remote pattern there would
  turn this site's own image optimiser into a fetcher for any URL a
  payload names. The plain `<img>` is given an explicit width and
  height to avoid layout shift and `loading="lazy"` (except the
  featured post, which loads eagerly), and only ever renders an
  `https://` URL; anything else falls back to the placeholder.
- Every post's tags link to `/tags/[tag]`, a page listing every post
  with that tag, with `CollectionPage` and `ItemList` JSON-LD. `/tags`
  lists every tag in use. Tag pages are statically generated for every
  tag seen at build time and resolve on first request for a new one
  afterwards; both the push and pull routes revalidate the whole `/tags`
  subtree whenever a post is written.

## What this template does for search and AI assistants

- Canonical link, Open Graph and Twitter card meta, and a generated
  Open Graph image on every post.
- `BlogPosting` and `BreadcrumbList` JSON-LD on every post; `WebSite`
  plus `Person` or `Organization` JSON-LD on the home page;
  `CollectionPage`/`ItemList` JSON-LD on every tag page.
- `sitemap.xml` with `lastModified` for every post and tag page,
  `robots.txt` that allows search and AI crawlers by name (GPTBot,
  ClaudeBot, PerplexityBot, Google-Extended) and links the sitemap,
  `/feed.xml` (RSS), `/llms.txt` and `/llms-full.txt`.

None of this promises a ranking or a citation; it gives search engines
and AI assistants a clean, well-described copy of each post to read.

## Look and feel

Fraunces (a characterful display serif) for headlines and Work Sans (a
plain, highly readable sans) for body copy, both loaded through
`next/font/google` with no layout-shifting flash. Light and dark follow
`prefers-color-scheme`, both checked for WCAG AA contrast; every
interactive element has a visible focus ring and a minimum 44x44px tap
target, including each tag chip.

## Local development

```bash
npm install
npm run dev
```

Posts live in `content/posts/*.md` with front matter:

```yaml
---
title: "Hello, world"
slug: "hello-world"
date: "2026-09-27T09:00:00.000Z"
description: "One or two sentences for the card grid, RSS and meta tags."
tags: ["example"]
canonical: "" # leave unset unless this post's canonical lives elsewhere
cover: "" # leave unset to get the generated placeholder instead
---

Body in Markdown.
```

`npm run build`, `npm run typecheck`, `npm run lint` and `npm test` all
run against this folder alone; it has its own `package-lock.json` and no
`@scatterpost/*` dependency, so `npm install` works from a plain copy of
this folder with nothing else present.

## Keeping the connector code in sync

The scatterpost connector code under `src/lib/scatterpost/` is a copy of
this repository's `shared/` folder, made by
`node scripts/sync-shared.mjs` from the repository root. Do not hand-edit
files under `src/lib/scatterpost/`: edit `shared/`, run the sync script,
and commit the result. `node scripts/sync-shared.mjs --check` fails the
build if a copy has drifted.

## For an agent following this file

If you are an AI agent asked to set up a founder's blog and connect it
to scatterpost, this README is written so you can follow it end to end:
clone or deploy this folder, set the environment variables in the table
above for whichever mode (push or pull) the founder's scatterpost
workspace uses, run `supabase/posts.sql` first only if
`CONTENT_STORE=supabase`, then create the Website channel in scatterpost
with the exact JSON shown in "Connecting this site as a Website
channel". No step here needs anything outside this folder.
