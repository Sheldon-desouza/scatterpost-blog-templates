/**
 * Founder-edited site configuration: the bits a template owner changes
 * by hand rather than through an environment variable (nav links and
 * whether the footer credits scatterpost). Kept separate from
 * `site.ts`, which only reads `process.env`.
 */

export interface SiteLink {
  label: string;
  href: string;
}

/** Shown in the header, next to the product name. Add or remove freely. */
export const NAV_LINKS: SiteLink[] = [
  { label: "Changelog", href: "/changelog" },
  { label: "Blog", href: "/blog" },
];

/**
 * The optional "Published with scatterpost" footer line. On by default:
 * the template is free to use with or without it, but it costs the
 * founder nothing to leave on and it is how other founders find
 * scatterpost. Set `NEXT_PUBLIC_SHOW_SCATTERPOST_BADGE=false` to hide it.
 */
export function showScatterpostBadge(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_SCATTERPOST_BADGE !== "false";
}
