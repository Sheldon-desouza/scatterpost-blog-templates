/**
 * Founder-edited site configuration: the bits a template owner changes
 * by hand rather than through an environment variable (nav links, the
 * role line and bio under the name on the home page, and whether the
 * footer credits scatterpost). Kept separate from `site.ts`, which only
 * reads `process.env`.
 */

export interface SiteLink {
  label: string;
  href: string;
}

/** Shown in the header, next to the site name. Add or remove freely. */
export const NAV_LINKS: SiteLink[] = [
  { label: "Writing", href: "/blog" },
  { label: "Tags", href: "/tags" },
  { label: "RSS", href: "/feed.xml" },
];

/**
 * The one-line role shown directly under the name on the home page
 * (what the founder builds, in a few words). Replace before publishing.
 */
export const ROLE = "Founder, building in the open.";

/**
 * The short bio paragraph under the role line. Plain text, no
 * scatterpost mention: replace with your own before you publish.
 */
export const BIO = "Notes from the build: decisions, trade-offs, and the code behind them.";

/**
 * Shown as a quiet row under the bio on the home page. A placeholder
 * set, replace with your own (GitHub, X, email, and so on).
 */
export const SOCIAL_LINKS: SiteLink[] = [
  { label: "GitHub", href: "https://github.com" },
  { label: "RSS", href: "/feed.xml" },
];

/**
 * The optional "Published with scatterpost" footer line. On by default,
 * but only actually shown once the newer "Built with a scatterpost
 * template" credit is turned off (`NEXT_PUBLIC_SHOW_SCATTERPOST_CREDIT=
 * false`): a footer never carries both. Set
 * `NEXT_PUBLIC_SHOW_SCATTERPOST_BADGE=false` as well to show neither.
 */
export function showScatterpostBadge(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_SCATTERPOST_BADGE !== "false";
}
