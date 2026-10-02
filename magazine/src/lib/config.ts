/**
 * Founder-edited site configuration: the bits a template owner changes
 * by hand rather than through an environment variable (nav links, the
 * author block on the home page, and whether the footer credits
 * scatterpost). Kept separate from `site.ts`, which only reads
 * `process.env`.
 */
import { postsIndexPath } from "./scatterpost/post-paths.ts";

export interface SiteLink {
  label: string;
  href: string;
}

/** Shown in the header, next to the publication's wordmark. Add or
 * remove freely. */
export const NAV_LINKS: SiteLink[] = [
  { label: "Writing", href: postsIndexPath() },
  { label: "Tags", href: "/tags" },
];

/**
 * The author block at the foot of the home page: a short bio under the
 * author's name. Plain text, no scatterpost mention: replace with your
 * own before you publish (what you write about, who you write for, and
 * so on).
 */
export const BIO =
  "Longer pieces on building a product, written for other founders, published here first.";

/**
 * Optional photo for the author block, an `https://` URL. Left unset by
 * default: the block then shows just the name and bio, never a stock
 * photo.
 */
export const AUTHOR_PHOTO: string | undefined = undefined;

/**
 * Shown as a quiet row under the author block's bio. A placeholder set,
 * replace with your own (GitHub, X, email, and so on).
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
