/**
 * Shape of the push-mode payload scatterpost POSTs to `/api/scatterpost`,
 * and of a pull-mode publication after it is mapped to the same shape by
 * `preparePullPayload()` / `pullDuePublications()`. Kept as a standalone
 * zod schema, not imported from any private scatterpost package, so this
 * template has no runtime dependency on a private monorepo package.
 */
import { z } from "zod";

export const ScatterpostPayloadSchema = z.object({
  id: z.string().min(1),
  idempotencyKey: z.string().min(1),
  title: z.string().min(1),
  bodyMarkdown: z.string().min(1),
  bodyHtml: z.string().min(1).optional(),
  canonicalUrl: z.string().url().optional(),
  tags: z.array(z.string()),
  coverImageUrl: z.string().url().optional(),
  publishedAt: z.string(),
});

export type ScatterpostPayload = z.infer<typeof ScatterpostPayloadSchema>;
