import Link from "next/link";
import type { StoredPost } from "../lib/scatterpost/content-store.ts";
import { readingTimeMinutes } from "../lib/reading-time.ts";
import { slugify } from "../lib/scatterpost/slugify.ts";

/**
 * Dense index rows: a mono date, the title, a one-line summary, tag
 * chips and a reading time, one row per post, used on the home page,
 * `/blog` and every `/tags/[tag]` page so all three stay in sync.
 */
export function PostIndex({ posts }: { posts: StoredPost[] }) {
  return (
    <ul className="index-list">
      {posts.map((post) => (
        <li key={post.slug} className="index-row">
          <Link href={`/blog/${post.slug}`} className="index-row-link">
            <time dateTime={post.date} className="index-row-date">
              {new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" })}
            </time>
            <span className="index-row-body">
              <span className="index-row-title">{post.title}</span>
              {post.description ? <span className="index-row-summary">{post.description}</span> : null}
            </span>
            <span className="index-row-meta">
              {post.tags.length > 0 ? (
                <span className="index-row-tags">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </span>
              ) : null}
              <span className="index-row-time">{readingTimeMinutes(post.bodyMarkdown)} min</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Every distinct tag across `posts`, each with its slug (for
 * `/tags/[tag]`) and how many posts carry it, sorted most-used first. */
export function tagCounts(posts: StoredPost[]): Array<{ tag: string; slug: string; count: number }> {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = slugify(tag);
      if (!slug) continue;
      const existing = counts.get(slug);
      if (existing) existing.count += 1;
      else counts.set(slug, { tag, count: 1 });
    }
  }
  return [...counts.entries()]
    .map(([slug, { tag, count }]) => ({ tag, slug, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Posts carrying a given tag slug, plus the tag's original display
 * text (the first spelling encountered), for `/tags/[tag]`. */
export function postsForTagSlug(posts: StoredPost[], tagSlug: string): { tag: string; posts: StoredPost[] } | null {
  const matching = posts.filter((post) => post.tags.some((tag) => slugify(tag) === tagSlug));
  if (matching.length === 0) return null;
  const tag = matching[0]?.tags.find((candidate) => slugify(candidate) === tagSlug) ?? tagSlug;
  return { tag, posts: matching };
}

/** A quiet row of tag links shown under the home page's latest list and
 * at the top of `/blog`: each links to its `/tags/[tag]` page. */
export function TagFilterRow({ posts }: { posts: StoredPost[] }) {
  const tags = tagCounts(posts);
  if (tags.length === 0) return null;

  return (
    <nav className="tag-filter-row" aria-label="Filter by tag">
      {tags.map(({ tag, slug, count }) => (
        <Link key={slug} href={`/tags/${slug}`} className="tag-chip tag-chip-link">
          {tag} <span className="tag-chip-count">{count}</span>
        </Link>
      ))}
    </nav>
  );
}
