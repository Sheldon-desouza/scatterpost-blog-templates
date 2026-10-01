/**
 * Shape of the push-mode payload scatterpost POSTs to `/api/scatterpost`,
 * and of a pull-mode publication after it is mapped to the same shape by
 * `preparePullPayload()` / `pullDuePublications()`. Kept as a standalone
 * zod schema, not imported from any private scatterpost package, so this
 * template has no runtime dependency on a private monorepo package.
 */
import { z } from "zod";

/**
 * `z.string().url()` alone accepts `javascript:alert(1)` and plain
 * `http:` (security review L5): both are valid URLs, and the first runs
 * as script wherever the field is rendered as a link, the second lets a
 * mixed-content or downgradable link travel as the canonical or the
 * cover image src. Every scatterpost URL is https-only.
 */
const httpsUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"), { message: "Must be an https:// URL." });

export const ScatterpostPayloadSchema = z.object({
  id: z.string().min(1),
  idempotencyKey: z.string().min(1),
  title: z.string().min(1),
  bodyMarkdown: z.string().min(1),
  bodyHtml: z.string().min(1).optional(),
  canonicalUrl: httpsUrl.optional(),
  tags: z.array(z.string()),
  coverImageUrl: httpsUrl.optional(),
  publishedAt: z.string(),
});

export type ScatterpostPayload = z.infer<typeof ScatterpostPayloadSchema>;
