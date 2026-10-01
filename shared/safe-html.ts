const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g");
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g");

/**
 * Serialises a value for an inline `<script type="application/ld+json">`.
 * `JSON.stringify` alone does not escape `<`, so a post title such as
 * `</script><script>...` would close the tag and run as script on the
 * blog. Every `<` becomes the JSON escape for it (still valid JSON, the
 * same string once parsed), which also covers `<!--`; the Unicode line
 * and paragraph separators are escaped too, as some parsers treat them as
 * line terminators.
 */
export function serialiseJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(LINE_SEPARATOR, "\\u2028")
    .replace(PARAGRAPH_SEPARATOR, "\\u2029");
}

/**
 * The only shape a post slug can have: what `slugify` produces, plus the
 * numeric suffix collision handling adds. Anything else (`..`, `/`, an
 * encoded `%2F`, a backslash) is refused before it reaches a store, so a
 * URL can never name a file or object outside the posts directory.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 200 && SLUG_PATTERN.test(slug);
}
