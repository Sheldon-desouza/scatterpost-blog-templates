# demo

The site for `demo.scatterpost.io`: a gallery of the four blog templates in
this repository, each with a live demo and a one-click deploy button. Plain
static HTML and CSS, no framework, no build step.

## Deploy

- Vercel project, Root Directory set to `demo`.
- Domain: `demo.scatterpost.io`.
- No build command, no output directory override needed, it is a static
  folder.

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
- `NEXT_PUBLIC_DEMO_TEMPLATE=true`

## Previews

Drop a screenshot at `demo/previews/<slug>.png` (`minimal`, `developer`,
`magazine`, `changelog`) and the gallery card will use it; otherwise the
card falls back to a styled placeholder with the template's name.
