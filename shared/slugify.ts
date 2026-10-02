// `isValidSlug` (shared/safe-html.ts) caps a slug at 200 characters, and
// `resolveSlugAndWrite` (shared/content-store.ts) can append a `-N`
// collision suffix on top of whatever `slugify` returns. An uncapped
// slug from a long title could sit close enough to 200 that the suffix
// pushes it over, which `resolveSlugAndWrite` would then refuse to
// write at all (security re-review N3). Capped well under that ceiling
// here instead, cut at a hyphen so the slug never ends mid-word.
const MAX_SLUG_LENGTH = 80;

export interface SlugifyOptions {
  /**
   * Slugs a post may not take, because a top-level route already
   * answers there (only non-empty while `NEXT_PUBLIC_POSTS_AT_ROOT` is
   * on; see `reservedSlugsFor` in post-paths.ts).
   */
  reserved?: ReadonlySet<string>;
}

/**
 * Thrown when a title slugifies to a reserved slug. Deliberately a
 * refusal rather than a silent suffix: a post titled "Tags" quietly
 * published at `/tags-2` would surprise its author, while a clear
 * error (the receiver turns this into a 422, the pull run records it
 * against the publication) says exactly which word to change.
 */
export class ReservedSlugError extends Error {
  readonly slug: string;

  constructor(slug: string) {
    super(
      `The title produces the slug "${slug}", which is reserved because a page of this site already lives at /${slug}. Change the title and publish again.`,
    );
    this.name = "ReservedSlugError";
    this.slug = slug;
  }
}

export function slugify(title: string, options: SlugifyOptions = {}): string {
  return refuseReserved(baseSlugify(title), options);
}

function refuseReserved(slug: string, options: SlugifyOptions): string {
  if (slug.length > 0 && options.reserved?.has(slug)) {
    throw new ReservedSlugError(slug);
  }
  return slug;
}

function baseSlugify(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return truncateAtHyphen(slug, MAX_SLUG_LENGTH);
}

function truncateAtHyphen(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) {
    return slug;
  }
  const cut = slug.slice(0, maxLength);
  const lastHyphen = cut.lastIndexOf("-");
  const trimmed = lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut;
  return trimmed.replace(/-+$/, "");
}

/**
 * A title with no ASCII letters or digits (all emoji, CJK, punctuation,
 * or just empty) makes `slugify` return `""`, which would be saved as
 * `posts/.md` and returned as a canonical of `SITE/blog/` (security
 * review M1). Falls back to `post-<id prefix>` in that case; `id` is
 * slugified too, since a scatterpostId is not guaranteed to be
 * URL-safe on its own.
 */
export function slugifyWithFallback(title: string, id: string, options: SlugifyOptions = {}): string {
  const slug = slugify(title, options);
  if (slug.length > 0) {
    return slug;
  }
  const idSlug = baseSlugify(id).slice(0, 12);
  return refuseReserved(idSlug.length > 0 ? `post-${idSlug}` : "post", options);
}
