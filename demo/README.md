# demo

The site for `demo.scatterpost.io`: a gallery of the four blog templates in
this repository, each with a live demo and a one-click deploy button. Plain
static HTML and CSS, no framework, no build step.

## Deploy

- Vercel project, Root Directory set to `demo`.
- Domain: `demo.scatterpost.io`.
- No output directory override needed, it is a static folder.
- Build command: `node ../scripts/check-demo-hub.mjs` (or, from the repo
  root, `npm run check:demo-hub`). This fails the build while
  `vercel.json` still has a `REPLACE-` placeholder in it, see below, so a
  forgotten rewrite destination cannot ship.

## CSP and security headers

`vercel.json` matches a header rule's `source` against the incoming request
path before the rewrites above run, so a rule of `/(.*)` would also land on
every `/minimal`, `/developer`, `/magazine` and `/changelog` response,
stacking the hub's strict Content-Security-Policy on top of (or breaking)
whatever headers that template project already sends. The CSP,
`X-Frame-Options` and `Permissions-Policy` headers are therefore scoped to
the exact paths this static site serves (`/`, `/index.html`,
`/previews/*`, `/styles.css`, `/previews.js`), not to `/(.*)`, so they never
touch a rewritten template response. `X-Content-Type-Options` and
`Referrer-Policy` stay on `/(.*)` since they do not break a template app.

## Pre-deploy step

Run `npm run check:demo-hub` (or `node scripts/check-demo-hub.mjs` from the
repo root) before every deploy. It exits non-zero if `demo/vercel.json`
still contains a `REPLACE-` placeholder.

## Rewrites to fill in

`vercel.json` proxies `/minimal`, `/developer`, `/magazine` and `/changelog`
(and everything under them) through to each template's own deployed demo
project, so a visitor sees `demo.scatterpost.io/<slug>/...` while the
content is actually served from that template's Vercel project. Each
template demo project is expected to run with `NEXT_PUBLIC_BASE_PATH=/<slug>`,
which is why the destination keeps the `/<slug>` prefix.

Replace these four placeholders in `vercel.json` with the real production
URLs once each template's own demo project is deployed:

- `https://REPLACE-minimal-demo.vercel.app` -> the `minimal` template's demo project URL
- `https://REPLACE-developer-demo.vercel.app` -> the `developer` template's demo project URL
- `https://REPLACE-magazine-demo.vercel.app` -> the `magazine` template's demo project URL
- `https://REPLACE-changelog-demo.vercel.app` -> the `changelog` template's demo project URL

## Each template demo project needs

- `NEXT_PUBLIC_BASE_PATH=/<slug>` (e.g. `/minimal`)
- `NEXT_PUBLIC_SITE_URL=https://demo.scatterpost.io/<slug>`
- `NEXT_PUBLIC_DEMO_TEMPLATE=<Display Name>` (for example `Minimal`; shown in the demo bar)
- `NEXT_PUBLIC_DEMO_SEED_CONTENT=true` (shows the sample posts)

## Previews

Drop a screenshot at `demo/previews/<slug>.png` (`minimal`, `developer`,
`magazine`, `changelog`) and the gallery card will use it; otherwise the
card falls back to a styled placeholder with the template's name.
