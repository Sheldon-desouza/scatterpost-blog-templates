/**
 * Shape of the push-mode payload scatterpost POSTs to `/api/scatterpost`,
 * and of a pull-mode publication after it is mapped to the same shape by
 * `preparePullPayload()` / `pullDuePublications()`. Kept as a standalone
 * zod schema, not imported from any private scatterpost package, so this
 * template has no runtime dependency on a private monorepo package.
 */
import { z } from "zod";

/**
 * `z.string().url()` alone accepts `javascript:alert(1)` (security
 * review L5): a valid URL by RFC, but one that runs as script wherever
 * the field is rendered as a link or an image src. `http:` is a
 * legitimate scheme too, though: scatterpost is canonical-first (the
 * founder's own site is published before any cross-post, see
 * CLAUDE.md), and plenty of real sites are plain http during local dev
 * or before their own TLS is set up, so rejecting it here would block
 * the whole publish rather than guard anything (security re-review N2).
 * Only http and https ever reach a store or a page.
 */
export function isHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export const httpUrl = z.string().refine(isHttpUrl, { message: "Must be an http:// or https:// URL." });

/**
 * Same scheme rule as `httpUrl`, but for a field that is cosmetic
 * (the cover image) rather than load-bearing (the canonical URL): a
 * `javascript:` or `data:` value here is dropped to `undefined` instead
 * of failing the whole payload, since scatterpost can still publish the
 * post without a cover (security re-review N2).
 */
export const optionalHttpUrl = z
  .string()
  .nullable()
  .optional()
  .transform((value) => (typeof value === "string" && isHttpUrl(value) ? value : undefined));

export const ScatterpostPayloadSchema = z.object({
  id: z.string().min(1),
  idempotencyKey: z.string().min(1),
  title: z.string().min(1),
  bodyMarkdown: z.string().min(1),
  bodyHtml: z.string().min(1).optional(),
  canonicalUrl: httpUrl.optional(),
  tags: z.array(z.string()),
  coverImageUrl: optionalHttpUrl,
  publishedAt: z.string(),
});

export type ScatterpostPayload = z.infer<typeof ScatterpostPayloadSchema>;
