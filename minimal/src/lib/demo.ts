/**
 * Demo-mode env reads: the slim bar `DemoBar` renders above the header
 * (gated on `NEXT_PUBLIC_DEMO_TEMPLATE`), and the seeded demo posts
 * `getStore()` reads alongside a founder's own posts (gated on its own,
 * separate `NEXT_PUBLIC_DEMO_SEED_CONTENT`, so the demo bar can stay on
 * while seeding is switched off once real scatterpost posts arrive).
 * All optional, all unset in a normal deploy.
 */

/** This template's display name on the demo bar, e.g. "Minimal".
 * `undefined` (not merely falsy copy) is what `DemoBar` checks. */
export function demoTemplateName(): string | undefined {
  return process.env.NEXT_PUBLIC_DEMO_TEMPLATE || undefined;
}

// This template's own "Deploy with Vercel" clone URL, copied from the
// button in README.md, used when NEXT_PUBLIC_DEMO_DEPLOY_URL is unset.
const DEPLOY_URL_FALLBACK =
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSheldon-desouza%2Fscatterpost-blog-templates%2Ftree%2Fmain%2Fminimal&project-name=my-blog&repository-name=my-blog&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D&env=NEXT_PUBLIC_SITE_URL,SCATTERPOST_WEBHOOK_SECRET";

export function demoDeployUrl(): string {
  return process.env.NEXT_PUBLIC_DEMO_DEPLOY_URL || DEPLOY_URL_FALLBACK;
}

export function demoGalleryUrl(): string {
  return process.env.NEXT_PUBLIC_DEMO_GALLERY_URL || "https://demo.scatterpost.io/";
}

/**
 * Whether this deploy should list the committed demo posts under
 * `demo-content/posts` alongside (or, before a founder connects
 * scatterpost, instead of) its own `content/posts`. Separate from
 * `NEXT_PUBLIC_DEMO_TEMPLATE` (which only shows the bar above the
 * header) so a demo deploy can turn seeding off, once real posts exist,
 * without also hiding the bar. Must be exactly `"true"`: unset, empty or
 * any other value leaves a founder's own blog unaffected.
 */
export function demoSeedContent(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_SEED_CONTENT === "true";
}
