# Developer

A dark-first Next.js blog for a dev-tool founder, built to connect
straight to [scatterpost](https://scatterpost.io) as a Website channel.
Syntax-highlighted code blocks with a copy button, a table of contents
built from each post's headings, and a reading time estimate, on top
of the same SEO and AI-search foundation every template here ships. It
has no runtime dependency on any scatterpost package: the signature
verification, payload validation and content stores it needs are
self-contained under `src/lib/scatterpost/` (synced from this
repository's `shared/` folder by `scripts/sync-shared.mjs`), so this
folder works if it is copied out on its own.

## Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSheldon-desouza%2Fscatterpost-blog-templates%2Ftree%2Fmain%2Fdeveloper&project-name=my-blog&repository-name=my-blog&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D&env=NEXT_PUBLIC_SITE_URL,SCATTERPOST_WEBHOOK_SECRET)

The button clones this one folder into its own repository, provisions a
private Vercel Blob store for it, and prompts for the two environment
variables push mode needs (`NEXT_PUBLIC_SITE_URL`,
`SCATTERPOST_WEBHOOK_SECRET`). If you clone the whole
`scatterpost-blog-templates` repository yourself instead, set the
project's "Root Directory" to `developer`.

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

`vercel.json` ships with no `crons` block, so the default (push mode)
deploys cleanly on every Vercel plan, including Hobby. Pull mode needs
one:

- On a Pro plan or above, add to `vercel.json`:
  ```json
  "crons": [{ "path": "/api/scatterpost/pull", "schedule": "*/10 * * * *" }]
  ```
- On the Hobby plan, Vercel only allows a daily cron, so use once a day
  instead, e.g.:
  ```json
  "crons": [{ "path": "/api/scatterpost/pull", "schedule": "0 6 * * *" }]
  ```
  or run `npm run pull` (`scripts/pull.mjs`) yourself on whatever
  schedule you like (a GitHub Actions cron, for instance) instead of a
  Vercel cron at all.

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
   signature, writes the post, revalidates every page that shows it, and
   replies `{ "url": "..." }`.

Pull mode (this site polls scatterpost instead of receiving a webhook):

1. Deploy this site and set `NEXT_PUBLIC_SITE_URL`,
   `SCATTERPOST_API_URL`, `SCATTERPOST_API_KEY` and `CRON_SECRET`.
2. In scatterpost, add a channel with `platform: "website"` and
   `"mode": "pull"`.
3. Add a `crons` entry calling `/api/scatterpost/pull` to `vercel.json`
   (see "Environment variables" above for the Hobby-vs-Pro schedule), or
   run `npm run pull` (`scripts/pull.mjs`) yourself on a schedule of your
   own.

## How the canonical flows

Whichever mode you use, this site's own URL for a post becomes the
canonical for every cross-post scatterpost makes afterwards (Dev.to,
Hashnode, LinkedIn, and so on always carry a `canonicalUrl` pointing back
here, never the other way round). Every post page also sets its own
`<link rel="canonical">` to `post.canonical` (falling back to this
site's own URL for a post that has not gone through scatterpost, such as
one you write by hand in `content/posts/`), so the tag on the page
always agrees with what scatterpost recorded.

## What this template does for search and AI assistants

- Canonical link, Open Graph and Twitter card meta, and a generated
  Open Graph image on every post.
- `BlogPosting` and `BreadcrumbList` JSON-LD on every post; `WebSite`
  plus `Person` or `Organization` JSON-LD on the home page.
- `sitemap.xml` with `lastModified`, `robots.txt` that allows search and
  AI crawlers by name (GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended) and links the sitemap, `/feed.xml` (RSS), `/llms.txt`
  and `/llms-full.txt`.

None of this promises a ranking or a citation; it gives search engines
and AI assistants a clean, well-described copy of each post to read.

## What makes this template different

- Dark by default; switches to a light theme only through
  `prefers-color-scheme: light`. Headings and body text use Hanken
  Grotesk, code uses JetBrains Mono, both loaded through `next/font/google`.
- Fenced code blocks are syntax-highlighted on the server with
  [Shiki](https://shiki.style) (`src/lib/render-post-html.ts`), themed
  for both dark and light with the same media query as the rest of the
  page. Highlighting never weakens sanitisation: Shiki escapes the code
  it tokenises, the language tag is restricted to a safe character set
  before it reaches Shiki, and the result is still passed through
  `sanitize-html`. See `render-post-html.test.ts` for the malicious
  code fence and language tag tests.
- A table of contents is built from each post's `h2`/`h3` headings,
  with unique, slugified anchor ids; it is a sticky sidebar at a wide
  viewport and a collapsible `<details>` above the post on a narrow
  one, both with no JavaScript needed (`src/components/table-of-contents.tsx`).
  Every heading's anchor is itself a link.
- A small client component adds a "Copy code" button, with an
  accessible label and a 44px tap target, to every highlighted block
  once the page loads (`src/components/code-copy-buttons.tsx`).
- Each post shows an estimated reading time (`src/lib/reading-time.ts`).

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
description: "One or two sentences for the list page, RSS and meta tags."
tags: ["example"]
canonical: "" # leave unset unless this post's canonical lives elsewhere
cover: "" # leave unset if there is no cover image
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
