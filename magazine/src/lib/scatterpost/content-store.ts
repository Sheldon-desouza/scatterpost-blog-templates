/**
 * A blog post as scatterpost hands it over (push payload, or a pull-mode
 * publication mapped to the same shape) and as the store persists it.
 * `scatterpostId` is the identity used to decide whether a later write
 * with a colliding slug is an update of the same post or a genuine
 * collision with a different one.
 */
import { isValidSlug } from "./safe-html.ts";

export interface StoredPost {
  slug: string;
  scatterpostId: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  canonical?: string;
  cover?: string;
  coverAlt?: string;
  bodyMarkdown: string;
}

export interface SaveResult {
  slug: string;
  created: boolean;
}

/**
 * Pluggable persistence for posts written through the webhook or the
 * pull script. Three implementations ship here: `FileStore` (writes
 * Markdown files under `content/posts`, for local dev), `BlobStore`
 * (Vercel Blob, the default on Vercel) and `SupabaseStore` (a `posts`
 * table, an optional alternative). Chosen by `CONTENT_STORE` in each
 * template's `src/lib/site.ts`.
 */
export interface ContentStore {
  list(): Promise<StoredPost[]>;
  get(slug: string): Promise<StoredPost | null>;
  /**
   * Writes `post`. If no post occupies `post.slug`, it is written as
   * given. If a post already occupies that slug and its `scatterpostId`
   * matches `post.scatterpostId`, it is an update of the same post and is
   * overwritten in place. If a *different* post occupies that slug, a
   * numeric suffix (`-2`, `-3`, ...) is appended until a free or matching
   * slug is found; the slug actually written is returned. A different
   * post already on disk is never overwritten.
   */
  save(post: StoredPost): Promise<SaveResult>;
}

function slugCandidates(baseSlug: string): Generator<string> {
  function* generate(): Generator<string> {
    yield baseSlug;
    let n = 2;
    while (true) {
      yield `${baseSlug}-${n}`;
      n += 1;
    }
  }
  return generate();
}

/**
 * Shared collision resolution for any `ContentStore`: tries
 * `post.slug`, then `-2`, `-3`, ... until it finds a slug that is either
 * free or already holds a post with the same `scatterpostId`.
 * `getExisting` and `write` are the only store-specific parts.
 */
export async function resolveSlugAndWrite(
  post: StoredPost,
  getExisting: (slug: string) => Promise<StoredPost | null>,
  write: (slug: string, post: StoredPost) => Promise<void>,
): Promise<SaveResult> {
  // Defence in depth against security review M1: whatever built `post`
  // should already have fallen back off an empty or unsafe slug (see
  // `slugifyWithFallback`), but a store never writes a slug that fails
  // the same check a route uses to read one back.
  if (!isValidSlug(post.slug)) {
    throw new Error(`Refusing to save a post with an invalid slug: ${JSON.stringify(post.slug)}.`);
  }

  for (const candidate of slugCandidates(post.slug)) {
    const existing = await getExisting(candidate);
    if (!existing || existing.scatterpostId === post.scatterpostId) {
      await write(candidate, { ...post, slug: candidate });
      return { slug: candidate, created: !existing };
    }
    // A different post holds this slug: try the next suffix.
  }
  // Unreachable: slugCandidates() never terminates on its own.
  throw new Error("Could not resolve a free slug.");
}
