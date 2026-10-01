# scatterpost blog templates

Free, MIT-licensed Next.js blog templates for a founder who has no blog
yet, built to connect straight to [scatterpost](https://scatterpost.io)
(the publishing pipeline for AI agents: it writes your content, publishes
it to your own blog first, then cross-posts elsewhere with a canonical
link back here) as a Website channel.

Four templates, one repository, each with its own Deploy to Vercel
button and its own folder you can copy out on its own:

| Template | Status | Description |
|---|---|---|
| [`minimal/`](./minimal) | Live | Single column, readable, serif, light and dark. |
| [`developer/`](./developer) | Live | Syntax highlighting, table of contents, dark-first. |
| [`magazine/`](./magazine) | Live | Card grid home with cover images, tags and categories. |
| [`changelog/`](./changelog) | Live | Blog plus a changelog timeline. |

## Deploy

| Template | Deploy |
|---|---|
| `minimal/` | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSheldon-desouza%2Fscatterpost-blog-templates%2Ftree%2Fmain%2Fminimal&project-name=my-blog&repository-name=my-blog&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D&env=NEXT_PUBLIC_SITE_URL,SCATTERPOST_WEBHOOK_SECRET) |
| `developer/` | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSheldon-desouza%2Fscatterpost-blog-templates%2Ftree%2Fmain%2Fdeveloper&project-name=my-blog&repository-name=my-blog&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D&env=NEXT_PUBLIC_SITE_URL,SCATTERPOST_WEBHOOK_SECRET) |
| `magazine/` | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSheldon-desouza%2Fscatterpost-blog-templates%2Ftree%2Fmain%2Fmagazine&project-name=my-blog&repository-name=my-blog&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D&env=NEXT_PUBLIC_SITE_URL,SCATTERPOST_WEBHOOK_SECRET) |
| `changelog/` | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSheldon-desouza%2Fscatterpost-blog-templates%2Ftree%2Fmain%2Fchangelog&project-name=my-changelog&repository-name=my-changelog&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D&env=NEXT_PUBLIC_SITE_URL,SCATTERPOST_WEBHOOK_SECRET) |

Each button clones this one folder into its own repository, with the
project's "Root Directory" preset to that template, and provisions a
private Vercel Blob store for it. Each template's own README has the
same button, plus the full environment variable table and both
connection modes (push and pull).

## Connecting to scatterpost

Every template ships `POST /api/scatterpost` (push mode: scatterpost
calls this site) and `GET /api/scatterpost/pull` (pull mode: this site
polls scatterpost on a schedule). Whichever mode you use, the template's
own URL for a post becomes the canonical scatterpost cross-posts with.
See a template's README for the exact steps and the JSON shape scatterpost
expects.

## Repository layout

```
LICENSE            MIT, Copyright (c) 2026 Sheldon de Souza
shared/             the scatterpost connector code once: signature verification,
                    payload validation, the content stores (Vercel Blob, Supabase,
                    file), pull, slugify, safe HTML and Markdown rendering, plus
                    their tests
scripts/sync-shared.mjs   copies shared/ into <template>/src/lib/scatterpost/;
                          --check exits 1 if any copy has drifted
minimal/            self-contained Next.js app; Vercel Root Directory = minimal
developer/          self-contained Next.js app; Vercel Root Directory = developer
magazine/           self-contained Next.js app; Vercel Root Directory = magazine
changelog/          self-contained Next.js app; Vercel Root Directory = changelog
```

Each template is self-contained: its own `package.json` and
`package-lock.json`, no `workspace:` or `@scatterpost/*` dependency, so
`npm install` works from a plain copy of that one folder. The connector
code under each template's `src/lib/scatterpost/` is a synced copy of
`shared/`, never hand-edited; run `npm run sync` from the repository
root after changing `shared/`, and `npm run check` to confirm nothing
has drifted.

## Storage

Vercel Blob is the default store once deployed with the button above (it
provisions a private Blob store for you); Supabase is kept as an
optional alternative, and the file store (`content/posts/*.md`) is for
local development. `CONTENT_STORE` chooses between them; see a
template's `.env.example`.

## Licence

MIT. This repository is independent of scatterpost's own proprietary
codebase: nothing here depends on a private package, and these
templates may be used, forked and redeployed freely under the terms of
the licence.
