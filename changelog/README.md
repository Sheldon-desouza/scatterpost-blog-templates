# Changelog

A changelog-plus-blog Next.js template, built to connect straight to
[scatterpost](https://scatterpost.io) as a Website channel. A post
tagged `"changelog"` (case-insensitive) renders as a dated entry in the
`/changelog` timeline; every other post renders as an article under
`/blog`. It has no runtime dependency on any scatterpost package: the
signature verification, payload validation and content stores it needs
are self-contained under `src/lib/scatterpost/` (synced from this
repository's `shared/` folder by `scripts/sync-shared.mjs`), so this
folder works if it is copied out on its own.

## Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSheldon-desouza%2Fscatterpost-blog-templates%2Ftree%2Fmain%2Fchangelog&project-name=my-changelog&repository-name=my-changelog&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D&env=NEXT_PUBLIC_SITE_URL,SCATTERPOST_WEBHOOK_SECRET)

The button clones this one folder into its own repository, provisions a
private Vercel Blob store for it, and prompts for the two environment
variables push mode needs (`NEXT_PUBLIC_SITE_URL`,
`SCATTERPOST_WEBHOOK_SECRET`). If you clone the whole
`scatterpost-blog-templates` repository yourself instead, set the
project's "Root Directory" to `changelog`.

Pull mode needs a few more variables; see the table below and set them
after the first deploy, or add them to the `env` list yourself before
clicking the button.

## Environment variables

See `.env.example` for the full list with comments. In short:

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | always | Public base URL of this deployment. |
| `SITE_NAME`, `SITE_DESCRIPTION` | always (optional) | Product name and one-line description, shown on the home page, in titles, Open Graph and Twitter cards, the feeds and the JSON-LD on every page. Sensible defaults apply if unset. |
| `AUTHOR_NAME`, `AUTHOR_URL` | always (optional) | Used in the JSON-LD on every page. `AUTHOR_NAME` defaults to `SITE_NAME`. |
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

## Changelog vs blog

Every post scatterpost writes through this site carries whatever tags
the article has in scatterpost. This template looks for one of them,
case-insensitively: `"changelog"`. A post with that tag is a changelog
entry, lives at `/changelog/[slug]`, and shows up in the `/changelog`
timeline grouped by month, newest first. Every other post is an
article, lives at `/blog/[slug]`, and shows up on `/blog`. There is no
separate content type and no second front-matter field to set: tag the
article `"changelog"` in scatterpost (or add it to a post's `tags` in
`content/posts/*.md` for local testing) and it appears in the right
place.

If a changelog entry's title starts with something that looks like a
version number, e.g. `v1.2.0: Faster exports` or `2.4 - New dashboard`,
it is parsed and shown as a small version label next to the title and
on the entry's Open Graph image. A title with no leading version still
works fine; the label is just left out.

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
   replies `{ "url": "..." }` at `/blog/[slug]` or `/changelog/[slug]`
   depending on whether the article is tagged `"changelog"`.

Pull mode (this site polls scatterpost instead of receiving a webhook):

1. Deploy this site and set `NEXT_PUBLIC_SITE_URL`,
   `SCATTERPOST_API_URL`, `SCATTERPOST_API_KEY` and `CRON_SECRET`.
2. In scatterpost, add a channel with `platform: "website"` and
   `"mode": "pull"`.
3. Either let `vercel.json`'s cron call `/api/scatterpost/pull` every ten
   minutes, or run `npm run pull` (`scripts/pull.mjs`) yourself on a
   schedule of your own.

## How the canonical flows

Whichever mode you use, this site's own URL for a post (under `/blog` or
`/changelog`, depending on its tags) becomes the canonical for every
cross-post scatterpost makes afterwards (Dev.to, Hashnode, LinkedIn, and
so on always carry a `canonicalUrl` pointing back here, never the other
way round). Every post page also sets its own `<link rel="canonical">`
to `post.canonical` (falling back to this site's own URL for a post that
has not gone through scatterpost, such as one you write by hand in
`content/posts/`), so the tag on the page always agrees with what
scatterpost recorded.

## What this template does for search and AI assistants

- Canonical link, Open Graph and Twitter card meta, and a generated
  Open Graph image on every post and changelog entry.
- `BlogPosting` and `BreadcrumbList` JSON-LD on every post and
  changelog entry (the breadcrumb reflects `/blog` or `/changelog`);
  `WebSite` plus `Person` or `Organization` JSON-LD on the home page.
- `sitemap.xml` with `lastModified` covering both sections; `robots.txt`
  that allows search and AI crawlers by name (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended) and links the sitemap and both feeds.
- Two RSS feeds: `/feed.xml` (everything) and `/changelog/feed.xml`
  (changelog only), both linked from every page with
  `rel="alternate"`.
- `/llms.txt` and `/llms-full.txt`, each listing the changelog and the
  blog as separate sections.

None of this promises a ranking or a citation; it gives search engines
and AI assistants a clean, well-described copy of each post and
changelog entry to read.

## Local development

```bash
npm install
npm run dev
```

Posts live in `content/posts/*.md` with front matter:

```yaml
---
title: "v1.2.0: Faster exports"
slug: "v1-2-0-faster-exports"
date: "2026-09-27T09:00:00.000Z"
description: "One or two sentences for the timeline, RSS and meta tags."
tags: ["changelog"]
canonical: "" # leave unset unless this post's canonical lives elsewhere
cover: "" # leave unset if there is no cover image
---

Body in Markdown.
```

Drop `"changelog"` from `tags` and the same front matter produces an
ordinary blog article instead. Two sample posts ship with this
template, one of each kind; delete them once you have connected a real
scatterpost workspace.

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
build if a copy has drifted. `src/lib/changelog.ts` (the changelog/blog
split, month grouping, version parsing, and the pull-mode URL builder)
is this template's own code, not synced from anywhere.

## For an agent following this file

If you are an AI agent asked to set up a founder's changelog and connect
it to scatterpost, this README is written so you can follow it end to
end: clone or deploy this folder, set the environment variables in the
table above for whichever mode (push or pull) the founder's scatterpost
workspace uses, run `supabase/posts.sql` first only if
`CONTENT_STORE=supabase`, then create the Website channel in scatterpost
with the exact JSON shown in "Connecting this site as a Website
channel". Tag an article `"changelog"` in scatterpost for it to appear
in the timeline rather than the blog. No step here needs anything
outside this folder.
