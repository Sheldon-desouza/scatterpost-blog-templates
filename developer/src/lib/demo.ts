/**
 * Demo-mode env reads for the slim bar `DemoBar` renders above the
 * header on demo.scatterpost.io. All optional, all unset in a normal
 * deploy: `NEXT_PUBLIC_DEMO_TEMPLATE` being unset is what keeps the bar
 * from ever rendering for a founder's own blog (see `DemoBar`).
 */

/** This template's display name on the demo bar, e.g. "Developer".
 * `undefined` (not merely falsy copy) is what `DemoBar` checks. */
export function demoTemplateName(): string | undefined {
  return process.env.NEXT_PUBLIC_DEMO_TEMPLATE || undefined;
}

// This template's own "Deploy with Vercel" clone URL, copied from the
// button in README.md, used when NEXT_PUBLIC_DEMO_DEPLOY_URL is unset.
const DEPLOY_URL_FALLBACK =
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSheldon-desouza%2Fscatterpost-blog-templates%2Ftree%2Fmain%2Fdeveloper&project-name=my-blog&repository-name=my-blog&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D&env=NEXT_PUBLIC_SITE_URL,SCATTERPOST_WEBHOOK_SECRET";

export function demoDeployUrl(): string {
  return process.env.NEXT_PUBLIC_DEMO_DEPLOY_URL || DEPLOY_URL_FALLBACK;
}

export function demoGalleryUrl(): string {
  return process.env.NEXT_PUBLIC_DEMO_GALLERY_URL || "https://demo.scatterpost.io/";
}
