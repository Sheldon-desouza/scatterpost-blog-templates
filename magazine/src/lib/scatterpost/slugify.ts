export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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
