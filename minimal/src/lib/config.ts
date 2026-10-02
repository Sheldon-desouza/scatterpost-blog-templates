/**
 * Founder-edited site configuration: the bits a template owner changes
 * by hand rather than through an environment variable (nav links, the
 * bio row of links, and whether the footer credits scatterpost). Kept
 * separate from `site.ts`, which only reads `process.env`.
 */

export interface SiteLink {
  label: string;
  href: string;
}

/** Shown in the header, next to the site name. Add or remove freely. */
export const NAV_LINKS: SiteLink[] = [{ label: "Writing", href: "/blog" }];

/**
 * The one-line bio under the author's name on the home page. Plain
 * text, no scatterpost mention: replace with your own before you
 * publish (what you write about, what you build, and so on).
 */
export const BIO = "Notes on building products, what shipped and what I learned along the way.";

/**
 * Shown as a quiet row under the one-line bio on the home page. A
 * placeholder set, replace with your own (GitHub, X, email, and so on).
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
