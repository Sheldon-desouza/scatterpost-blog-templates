/**
 * What makes this template a changelog-plus-blog: a post whose `tags`
 * include "changelog" (case-insensitive) is a changelog entry and
 * renders in the `/changelog` timeline; every other post is a blog
 * post and renders under `/blog`. No separate content type, no second
 * front-matter field, just the tag scatterpost (or a hand-written post)
 * already carries.
 */
import type { ContentStore, StoredPost } from "./scatterpost/content-store.ts";
import { changelogUrl, postUrl } from "./site.ts";

export const CHANGELOG_TAG = "changelog";

export function isChangelogPost(post: Pick<StoredPost, "tags">): boolean {
  return post.tags.some((tag) => tag.trim().toLowerCase() === CHANGELOG_TAG);
}

/** This post's own URL: `/changelog/[slug]` for a changelog entry,
 * `/blog/[slug]` for everything else. Callers still prefer
 * `post.canonical` over this when one is set. */
export function urlForPost(post: Pick<StoredPost, "slug" | "tags">): string {
  return isChangelogPost(post) ? changelogUrl(post.slug) : postUrl(post.slug);
}

export function splitPosts<T extends Pick<StoredPost, "tags">>(
  posts: T[],
): { blogPosts: T[]; changelogPosts: T[] } {
  const blogPosts: T[] = [];
  const changelogPosts: T[] = [];
  for (const post of posts) {
    (isChangelogPost(post) ? changelogPosts : blogPosts).push(post);
  }
  return { blogPosts, changelogPosts };
}

// A changelog entry's title may optionally lead with a version number,
// e.g. "v1.2.0: Faster exports" or "2.4 - New dashboard". Not required:
// a title with no leading version parses to `undefined` rather than
// throwing, since most changelog entries will not have one.
const VERSION_PATTERN = /^(v?\d+(?:\.\d+){1,2})\b/i;

export function parseVersion(title: string): string | undefined {
  const match = VERSION_PATTERN.exec(title.trim());
  return match ? match[1] : undefined;
}

/**
 * `pullDuePublications()` (in `./scatterpost/pull.ts`, synced from
 * `shared/` and never hand-edited) resolves each saved post's URL
 * through a `buildUrl(slug) => string` callback that only receives the
 * slug, not the post's tags, so it cannot itself tell a changelog entry
 * from a blog post. This wraps a `ContentStore` to remember each saved
 * post's tags by the slug it was actually written to, and returns a
 * `buildUrl` that looks the tags back up to route `/changelog/[slug]`
 * vs `/blog/[slug]` correctly, all without touching the synced file.
 */
export function withPullUrlBuilder(store: ContentStore): { store: ContentStore; buildUrl: (slug: string) => string } {
  const tagsBySlug = new Map<string, string[]>();

  const wrappedStore: ContentStore = {
    list: () => store.list(),
    get: (slug) => store.get(slug),
    save: async (post) => {
      const result = await store.save(post);
      tagsBySlug.set(result.slug, post.tags);
      return result;
    },
  };

  const buildUrl = (slug: string): string => urlForPost({ slug, tags: tagsBySlug.get(slug) ?? [] });

  return { store: wrappedStore, buildUrl };
}

export interface MonthGroup<T> {
  /** Sortable key, e.g. "2026-09". */
  key: string;
  /** Human label, e.g. "September 2026". */
  label: string;
  posts: T[];
}

/**
 * Groups posts by calendar month (UTC, so a post's grouping does not
 * shift with the server's local time zone), newest month first, posts
 * within a month newest first. Used for the `/changelog` timeline.
 */
export function groupByMonth<T extends Pick<StoredPost, "date">>(posts: T[]): MonthGroup<T>[] {
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
  const groups = new Map<string, MonthGroup<T>>();

  for (const post of sorted) {
    const date = new Date(post.date);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    let group = groups.get(key);
    if (!group) {
      const label = date.toLocaleDateString("en-GB", { year: "numeric", month: "long", timeZone: "UTC" });
      group = { key, label, posts: [] };
      groups.set(key, group);
    }
    group.posts.push(post);
  }

  // `Map` preserves insertion order, and posts arrived newest first, so
  // the first month seen is already the newest.
  return [...groups.values()];
}
