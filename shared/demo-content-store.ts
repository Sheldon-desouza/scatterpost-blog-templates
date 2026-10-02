/**
 * Wraps a template's real `ContentStore` with a second, read-only store
 * of committed demo posts, used only while `NEXT_PUBLIC_DEMO_TEMPLATE`
 * is set (see each template's `src/lib/site.ts`). Demo posts list and
 * read alongside whatever the real store holds; `save()` always goes to
 * the real store, so the webhook, the pull script and scatterpost never
 * write into (or need to know about) the demo folder.
 */
import type { ContentStore, SaveResult, StoredPost } from "./content-store.ts";

export class DemoContentStore implements ContentStore {
  constructor(
    private readonly real: ContentStore,
    private readonly demo: ContentStore,
  ) {}

  async list(): Promise<StoredPost[]> {
    const [demoPosts, realPosts] = await Promise.all([this.demo.list(), this.real.list()]);
    const realSlugs = new Set(realPosts.map((post) => post.slug));
    const demoPostsNotShadowed = demoPosts.filter((post) => !realSlugs.has(post.slug));
    return [...demoPostsNotShadowed, ...realPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async get(slug: string): Promise<StoredPost | null> {
    // A real post always wins: a demo post must never shadow a published one.
    const realPost = await this.real.get(slug);
    if (realPost) return realPost;
    return this.demo.get(slug);
  }

  save(post: StoredPost): Promise<SaveResult> {
    return this.real.save(post);
  }
}
