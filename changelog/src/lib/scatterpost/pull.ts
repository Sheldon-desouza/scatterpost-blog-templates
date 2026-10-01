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
import type { ContentStore, StoredPost } from "./content-store.ts";
import { slugify } from "./slugify.ts";

interface PublicationRow {
  id: string;
  article_id: string;
  adapted_title: string | null;
  adapted_body: string | null;
  idempotency_key: string;
}

interface ArticleRow {
  id: string;
  title: string;
  body_markdown: string;
  tags: string[];
  canonical_url: string | null;
  cover_image_url: string | null;
}

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

async function apiRequest<T>(deps: Required<Pick<PullDeps, "apiUrl" | "apiKey" | "fetchImpl">>, path: string, init?: RequestInit): Promise<T> {
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
  return (await response.json()) as T;
}

export async function pullDuePublications(deps: PullDeps): Promise<PullSummary> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const now = deps.now ?? (() => new Date());
  const base = { apiUrl: deps.apiUrl, apiKey: deps.apiKey, fetchImpl };

  const summary: PullSummary = { checked: 0, published: 0, failed: 0, errors: [] };

  const { data: publications } = await apiRequest<{ data: PublicationRow[] }>(
    base,
    "/api/v1/publications?channel=website&due=true",
  );

  for (const publication of publications) {
    summary.checked += 1;
    try {
      const article = await apiRequest<ArticleRow>(base, `/api/v1/articles/${publication.article_id}`);

      const title = publication.adapted_title ?? article.title;
      const post: StoredPost = {
        slug: slugify(title),
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

      await apiRequest(base, `/api/v1/publications/${publication.id}`, {
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
