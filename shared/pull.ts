/**
 * Pull-mode website connector: this site polls
 * `GET /api/v1/publications?channel=website&due=true` instead of
 * receiving a push, writes each due publication's article through the
 * `ContentStore`, then reports completion with
 * `PATCH /api/v1/publications/:id { status: "published", url }`.
 *
 * A publication only carries `article_id`, `adapted_title` and
 * `adapted_body`; the full post content lives on the article, so each
 * due publication needs one extra `GET /articles/:id`. `adapted_title`
 * and `adapted_body`, when set, override the article's own title and
 * body for this one connection.
 *
 * Used by both the app's `/api/scatterpost/pull` route (Vercel Cron) and
 * `scripts/pull.mjs` (manual or non-Vercel cron); this is the one tested
 * implementation.
 */
import { z } from "zod";
import type { ContentStore, StoredPost } from "./content-store.ts";
import { slugifyWithFallback } from "./slugify.ts";

/**
 * The scatterpost API response is never trusted as-is (security review
 * L2): a malformed or unexpectedly-shaped response is rejected here
 * rather than flowing through to `StoredPost` with `undefined` fields
 * or the wrong types.
 */
const PublicationRowSchema = z.object({
  id: z.string().min(1),
  article_id: z.string().min(1),
  adapted_title: z.string().nullable(),
  adapted_body: z.string().nullable(),
  idempotency_key: z.string().min(1),
});

const PublicationsResponseSchema = z.object({ data: z.array(PublicationRowSchema) });

const ArticleRowSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body_markdown: z.string().min(1),
  tags: z.array(z.string()),
  canonical_url: z.string().url().nullable(),
  cover_image_url: z.string().url().nullable(),
});

export interface PullDeps {
  apiUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
  store: ContentStore;
  buildUrl: (slug: string) => string;
  now?: () => Date;
}

export interface PullSummary {
  checked: number;
  published: number;
  failed: number;
  errors: string[];
}

async function apiRequest<T>(
  deps: Required<Pick<PullDeps, "apiUrl" | "apiKey" | "fetchImpl">>,
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await deps.fetchImpl(`${deps.apiUrl.replace(/\/+$/, "")}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${deps.apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`scatterpost API request to ${path} failed with ${response.status}: ${body}`);
  }
  const json = await response.json();
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new Error(`scatterpost API response from ${path} failed validation: ${result.error.message}`);
  }
  return result.data;
}

export async function pullDuePublications(deps: PullDeps): Promise<PullSummary> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const now = deps.now ?? (() => new Date());
  const base = { apiUrl: deps.apiUrl, apiKey: deps.apiKey, fetchImpl };

  const summary: PullSummary = { checked: 0, published: 0, failed: 0, errors: [] };

  const { data: publications } = await apiRequest(
    base,
    "/api/v1/publications?channel=website&due=true",
    PublicationsResponseSchema,
  );

  for (const publication of publications) {
    summary.checked += 1;
    try {
      // Both ids come from the scatterpost API response, not from this
      // site's own input, but are still encoded before they join a URL
      // path: a crafted id could otherwise redirect the request to an
      // unintended path segment (security review L2).
      const article = await apiRequest(
        base,
        `/api/v1/articles/${encodeURIComponent(publication.article_id)}`,
        ArticleRowSchema,
      );

      const title = publication.adapted_title ?? article.title;
      const post: StoredPost = {
        slug: slugifyWithFallback(title, publication.idempotency_key),
        scatterpostId: publication.idempotency_key,
        title,
        date: now().toISOString(),
        description: "",
        tags: article.tags,
        canonical: article.canonical_url ?? undefined,
        cover: article.cover_image_url ?? undefined,
        bodyMarkdown: publication.adapted_body ?? article.body_markdown,
      };

      const { slug } = await deps.store.save(post);
      const url = deps.buildUrl(slug);

      await apiRequest(base, `/api/v1/publications/${encodeURIComponent(publication.id)}`, z.unknown(), {
        method: "PATCH",
        body: JSON.stringify({ status: "published", url }),
      });

      summary.published += 1;
    } catch (cause) {
      summary.failed += 1;
      summary.errors.push(cause instanceof Error ? cause.message : String(cause));
    }
  }

  return summary;
}
