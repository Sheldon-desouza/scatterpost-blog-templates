// `isValidSlug` (shared/safe-html.ts) caps a slug at 200 characters, and
// `resolveSlugAndWrite` (shared/content-store.ts) can append a `-N`
// collision suffix on top of whatever `slugify` returns. An uncapped
// slug from a long title could sit close enough to 200 that the suffix
// pushes it over, which `resolveSlugAndWrite` would then refuse to
// write at all (security re-review N3). Capped well under that ceiling
// here instead, cut at a hyphen so the slug never ends mid-word.
const MAX_SLUG_LENGTH = 80;

export function slugify(title: string): string {
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
export function slugifyWithFallback(title: string, id: string): string {
  const slug = slugify(title);
  if (slug.length > 0) {
    return slug;
  }
  const idSlug = slugify(id).slice(0, 12);
  return idSlug.length > 0 ? `post-${idSlug}` : "post";
}
