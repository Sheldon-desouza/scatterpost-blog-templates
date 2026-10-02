/**
 * Where a post lives, as a path relative to the app's own root (so it
 * works as a `next/link` href, a `revalidatePath` argument, or, joined
 * onto `siteUrl()`, as an absolute URL). The single source for every
 * post URL the templates build: `postUrl` in each template's `site.ts`
 * is `siteUrl() + postPath(slug)`.
 *
 * `NEXT_PUBLIC_POSTS_AT_ROOT=true` is an opt-in for a blog that is
 * already served under a path of its own (for example
 * `NEXT_PUBLIC_BASE_PATH=/blog`, proxied at `example.com/blog`): the
 * post listing moves to the base path root and each post to `/<slug>`,
 * so a post is `example.com/blog/<slug>` rather than
 * `example.com/blog/blog/<slug>`. Unset (the default), posts stay at
 * `/blog/<slug>` and the listing at `/blog`, exactly as before.
 *
 * Read at call time rather than once at import, so tests can flip it.
 * Written out as the literal `process.env.NEXT_PUBLIC_POSTS_AT_ROOT`
 * so Next inlines it into any client bundle that imports this file.
 */
export function postsAtRoot(): boolean {
  return process.env.NEXT_PUBLIC_POSTS_AT_ROOT === "true";
}

/** `/blog/<slug>` by default, `/<slug>` with posts at the root. */
export function postPath(slug: string): string {
  return postsAtRoot() ? `/${slug}` : `/blog/${slug}`;
}

/** The full post listing: `/blog` by default, `/` with posts at the root. */
export function postsIndexPath(): string {
  return postsAtRoot() ? "/" : "/blog";
}

/**
 * Top-level names a post slug may never take once posts live at the
 * root, because a route already answers there (or, for `blog`, a
 * permanent redirect does). Each template adds the routes its own
 * `src/app` directory actually has (see its `top-level-routes.ts`).
 * Some of these (the dotted ones) can never come out of `slugify`;
 * they are listed anyway so the set reads as the full list of taken
 * names rather than only the reachable ones.
 */
export const BASE_RESERVED_SLUGS: readonly string[] = [
  "blog",
  "feed.xml",
  "sitemap.xml",
  "robots.txt",
  "llms.txt",
  "api",
  "tags",
  "changelog",
  "opengraph-image",
];

/**
 * The slugs `slugify` must refuse: empty while the option is off (so
 * behaviour is unchanged), otherwise `BASE_RESERVED_SLUGS` plus the
 * template's own top-level routes.
 */
export function reservedSlugsFor(topLevelRoutes: readonly string[]): ReadonlySet<string> {
  if (!postsAtRoot()) {
    return new Set();
  }
  return new Set([...BASE_RESERVED_SLUGS, ...topLevelRoutes]);
}
