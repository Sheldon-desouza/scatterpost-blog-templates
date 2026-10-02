/**
 * Every name that answers at the top level of this site, taken from
 * `src/app` (a folder is its own name; `robots.ts` and `sitemap.ts`
 * answer at `robots.txt` and `sitemap.xml`). With
 * NEXT_PUBLIC_POSTS_AT_ROOT=true a post lives at `/<slug>`, so a slug
 * equal to one of these would be shadowed by the route; `slugify`
 * refuses them instead. `top-level-routes.test.ts` reads `src/app` and
 * fails if a new top-level route is added without being listed here.
 */
import { reservedSlugsFor } from "./scatterpost/post-paths.ts";

export const TOP_LEVEL_ROUTES: readonly string[] = [
  "api",
  "blog",
  "changelog",
  "feed.xml",
  "llms-full.txt",
  "llms.txt",
  "robots.txt",
  "sitemap.xml",
];

/** Empty while NEXT_PUBLIC_POSTS_AT_ROOT is off, so nothing changes. */
export function reservedSlugs(): ReadonlySet<string> {
  return reservedSlugsFor(TOP_LEVEL_ROUTES);
}
