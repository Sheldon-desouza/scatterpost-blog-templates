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
 * A response can page: `next_cursor` is followed with `&cursor=...` on
 * the next request until it comes back null, or until `MAX_PAGES` pages
 * have been fetched, whichever comes first (security re-review
 * L8-adjacent).
 *
 * Used by both the app's `/api/scatterpost/pull` route (Vercel Cron) and
 * `scripts/pull.mjs` (manual or non-Vercel cron); this is the one tested
 * implementation.
 */
import { z } from "zod";
import type { ContentStore, StoredPost } from "./content-store.ts";
import { httpUrl, optionalHttpUrl } from "./scatterpost-payload.ts";
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

const PublicationsResponseSchema = z.object({
  data: z.array(PublicationRowSchema),
  // Null (or absent, from an older API build) on the last page; present
  // and non-null means there is another page to follow (security
  // re-review L8-adjacent, see pullDuePublications below).
  next_cursor: z.string().nullable().optional(),
});

/**
 * `body_markdown` is `""` by server default on an article scatterpost
 * has not yet adapted a body for (the real body then lives on the
 * publication's own `adapted_body`): rejecting an empty string here
 * would reject every such article outright, even though
 * `pullDuePublications` falls back to `adapted_body` first and only
 * reaches `body_markdown` when that is absent too (security re-review
 * N1). The combined body is still required to be non-empty before a
 * post is ever saved; see the check after the fallback.
 */
const ArticleRowSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body_markdown: z.string(),
  tags: z.array(z.string()),
  // Same http(s)-only scheme rule as the push payload (security
  // re-review N2): the canonical URL is load-bearing, so an
  // unexpected scheme fails the article outright, while the cover is
  // cosmetic and is silently dropped instead.
  canonical_url: httpUrl.nullable(),
  cover_image_url: optionalHttpUrl,
});

export interface PullDeps {
  apiUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
  store: ContentStore;
  buildUrl: (slug: string) => string;
  now?: () => Date;
  // Called with each newly published post's URL, after the PATCH back
  // to scatterpost succeeds. Optional, and never awaited by this
  // function: the pull route uses it to fire an IndexNow ping per post
  // without this module needing to know anything about IndexNow.
  onPublished?: (url: string) => void;
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

// A run that followed `next_cursor` without limit could be made to loop
// forever by a misbehaving or compromised API response; capped at a
// generous but finite number of pages instead (security re-review
// L8-adjacent). One run processing up to 10 pages of due publications
// is already far more than a single cron tick is expected to see.
const MAX_PAGES = 10;

export async function pullDuePublications(deps: PullDeps): Promise<PullSummary> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const now = deps.now ?? (() => new Date());
  const base = { apiUrl: deps.apiUrl, apiKey: deps.apiKey, fetchImpl };

  const summary: PullSummary = { checked: 0, published: 0, failed: 0, errors: [] };

  let cursor: string | null | undefined;
  let page = 0;

  do {
    const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
    const { data: publications, next_cursor } = await apiRequest(
      base,
      `/api/v1/publications?channel=website&due=true${cursorParam}`,
      PublicationsResponseSchema,
    );
    page += 1;

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

        // `adapted_body` carries the real body for this connection when
        // set; `body_markdown` is `""` by server default otherwise
        // (security re-review N1). Either way, a post with no body at
        // all is refused here rather than saved and published empty.
        const bodyMarkdown = publication.adapted_body ?? article.body_markdown;
        if (bodyMarkdown.length === 0) {
          throw new Error(
            `Publication ${publication.id} (article ${publication.article_id}) has no body: both adapted_body and the article's body_markdown are empty.`,
          );
        }

        const title = publication.adapted_title ?? article.title;
        const post: StoredPost = {
          slug: slugifyWithFallback(title, publication.idempotency_key),
          scatterpostId: publication.idempotency_key,
          title,
          date: now().toISOString(),
          description: "",
          tags: article.tags,
          canonical: article.canonical_url ?? undefined,
          cover: article.cover_image_url,
          bodyMarkdown,
        };

        const { slug } = await deps.store.save(post);
        const url = deps.buildUrl(slug);

        await apiRequest(base, `/api/v1/publications/${encodeURIComponent(publication.id)}`, z.unknown(), {
          method: "PATCH",
          body: JSON.stringify({ status: "published", url }),
        });

        summary.published += 1;
        deps.onPublished?.(url);
      } catch (cause) {
        summary.failed += 1;
        summary.errors.push(cause instanceof Error ? cause.message : String(cause));
      }
    }

    cursor = next_cursor;
  } while (cursor && page < MAX_PAGES);

  return summary;
}
