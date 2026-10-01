/**
 * Tag helpers for the `/tags/[tag]` collection pages. A tag's slug is
 * its own tag string run through the same `slugify` a post's own slug
 * uses, so "Product Design" and "product design" collapse onto the
 * same `/tags/product-design` page, and the URL is always the safe
 * `isValidSlug` shape a dynamic route param can trust.
 */
import type { StoredPost } from "./scatterpost/content-store.ts";
import { slugify } from "./scatterpost/slugify.ts";

export interface TagSummary {
  tag: string;
  slug: string;
  count: number;
}

/** All distinct tags across `posts`, each with the display name of the
 * first post that used it (so capitalisation is preserved) and a count,
 * sorted by post count then alphabetically. */
export function collectTags(posts: StoredPost[]): TagSummary[] {
  const bySlug = new Map<string, TagSummary>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = slugify(tag);
      if (!slug) continue;
      const existing = bySlug.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        bySlug.set(slug, { tag, slug, count: 1 });
      }
    }
  }

  return [...bySlug.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function postsForTagSlug(posts: StoredPost[], tagSlug: string): StoredPost[] {
  return posts.filter((post) => post.tags.some((tag) => slugify(tag) === tagSlug));
}

/** The display name for a tag slug, taken from the first matching post,
 * falling back to the slug itself (e.g. for a tag page with no posts). */
export function tagNameForSlug(posts: StoredPost[], tagSlug: string): string {
  for (const post of posts) {
    const match = post.tags.find((tag) => slugify(tag) === tagSlug);
    if (match) return match;
  }
  return tagSlug;
}
