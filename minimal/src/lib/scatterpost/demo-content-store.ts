/**
 * Wraps a template's real `ContentStore` with a second, read-only store
 * of committed demo posts, used only while `NEXT_PUBLIC_DEMO_TEMPLATE`
 * is set (see each template's `src/lib/site.ts`). Demo posts list and
 * read alongside whatever the real store holds; `save()` always goes to
 * the real store, so the webhook, the pull script and scatterpost never
 * write into (or need to know about) the demo folder.
 *
 * The real store also holds the bundled starter sample(s) (`hello-world`,
 * plus `v1-0-0-launch` for the changelog template), committed so the
 * template works out of the box before anyone connects scatterpost.
 * Those aren't part of the demo and would otherwise sit alongside the
 * six seeded demo posts on a live demo, so they're filtered out here by
 * `scatterpostId`: a starter sample's id always starts with "sample-",
 * while a post pushed by scatterpost always carries a publication UUID,
 * which can never take that form. The prefix is therefore a safe marker
 * and never hides a real post.
 */
import type { ContentStore, SaveResult, StoredPost } from "./content-store.ts";

const STARTER_SAMPLE_ID_PATTERN = /^sample-/;

function isStarterSample(post: StoredPost): boolean {
  return STARTER_SAMPLE_ID_PATTERN.test(post.scatterpostId);
}

export class DemoContentStore implements ContentStore {
  constructor(
    private readonly real: ContentStore,
    private readonly demo: ContentStore,
  ) {}

  async list(): Promise<StoredPost[]> {
    const [demoPosts, realPosts] = await Promise.all([this.demo.list(), this.real.list()]);
    const realPostsWithoutStarters = realPosts.filter((post) => !isStarterSample(post));
    const realSlugs = new Set(realPostsWithoutStarters.map((post) => post.slug));
    const demoPostsNotShadowed = demoPosts.filter((post) => !realSlugs.has(post.slug));
    return [...demoPostsNotShadowed, ...realPostsWithoutStarters].sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async get(slug: string): Promise<StoredPost | null> {
    // A real post always wins: a demo post must never shadow a published
    // one. Except the bundled starter sample, which isn't part of the
    // demo at all and must stay hidden while seeding is on.
    const realPost = await this.real.get(slug);
    if (realPost && !isStarterSample(realPost)) return realPost;
    return this.demo.get(slug);
  }

  save(post: StoredPost): Promise<SaveResult> {
    return this.real.save(post);
  }
}
