import { describe, expect, it, vi } from "vitest";
import { pullDuePublications } from "./pull.ts";
import type { ContentStore, StoredPost } from "./content-store.ts";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function fakeStore(): ContentStore & { saved: StoredPost[] } {
  const saved: StoredPost[] = [];
  return {
    saved,
    async list() {
      return saved;
    },
    async get(slug) {
      return saved.find((post) => post.slug === slug) ?? null;
    },
    async save(post) {
      saved.push(post);
      return { slug: post.slug, created: true };
    },
  };
}

const publication = {
  id: "pub_1",
  article_id: "article_1",
  adapted_title: null,
  adapted_body: null,
  idempotency_key: "idem_1",
};

const article = {
  id: "article_1",
  title: "Ship it",
  body_markdown: "# Ship it\n\nContent goes here.",
  tags: ["launch"],
  canonical_url: null,
  cover_image_url: null,
};

describe("pullDuePublications", () => {
  it("writes each due publication through the store and PATCHes it to published", async () => {
    const store = fakeStore();
    const patchCalls: { url: string; init?: RequestInit }[] = [];

    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/api/v1/publications?channel=website&due=true")) {
        return jsonResponse({ data: [publication], next_cursor: null });
      }
      if (url.endsWith("/api/v1/articles/article_1")) {
        return jsonResponse(article);
      }
      if (url.endsWith("/api/v1/publications/pub_1") && init?.method === "PATCH") {
        patchCalls.push({ url, init });
        return jsonResponse({ ...publication, status: "published" });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const summary = await pullDuePublications({
      apiUrl: "https://api.scatterpost.io",
      apiKey: "test-fixture-api-key",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      store,
      buildUrl: (slug) => `https://founder.example.com/blog/${slug}`,
      now: () => new Date("2026-09-27T09:00:00.000Z"),
    });

    expect(summary).toEqual({ checked: 1, published: 1, failed: 0, errors: [] });
    expect(store.saved).toHaveLength(1);
    expect(store.saved[0]).toMatchObject({ slug: "ship-it", scatterpostId: "idem_1", title: "Ship it" });

    expect(patchCalls).toHaveLength(1);
    expect(JSON.parse(patchCalls[0]!.init!.body as string)).toEqual({
      status: "published",
      url: "https://founder.example.com/blog/ship-it",
    });
    // Auth header carries the API key on every call, including the PATCH.
    const headers = new Headers(patchCalls[0]!.init!.headers);
    expect(headers.get("Authorization")).toBe("Bearer test-fixture-api-key");
  });

  it("counts a failed publication without stopping the run", async () => {
    const store = fakeStore();
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.endsWith("/api/v1/publications?channel=website&due=true")) {
        return jsonResponse({ data: [publication], next_cursor: null });
      }
      if (url.endsWith("/api/v1/articles/article_1")) {
        return jsonResponse({ error: "boom" }, 500);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const summary = await pullDuePublications({
      apiUrl: "https://api.scatterpost.io",
      apiKey: "test-fixture-api-key",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      store,
      buildUrl: (slug) => `https://founder.example.com/blog/${slug}`,
    });

    expect(summary.checked).toBe(1);
    expect(summary.published).toBe(0);
    expect(summary.failed).toBe(1);
    expect(summary.errors).toHaveLength(1);
    expect(store.saved).toHaveLength(0);
  });

  it("counts a malformed article response as a failure rather than saving it (security review L2)", async () => {
    const store = fakeStore();
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.endsWith("/api/v1/publications?channel=website&due=true")) {
        return jsonResponse({ data: [publication], next_cursor: null });
      }
      if (url.endsWith("/api/v1/articles/article_1")) {
        // Missing `body_markdown` and the wrong type for `tags`: a
        // response shape scatterpost should never send, but one this
        // client must not trust blindly either.
        return jsonResponse({ id: "article_1", title: "Ship it", tags: "launch" });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const summary = await pullDuePublications({
      apiUrl: "https://api.scatterpost.io",
      apiKey: "test-fixture-api-key",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      store,
      buildUrl: (slug) => `https://founder.example.com/blog/${slug}`,
    });

    expect(summary.failed).toBe(1);
    expect(summary.errors[0]).toMatch(/failed validation/);
    expect(store.saved).toHaveLength(0);
  });

  it("encodes an article or publication id that would otherwise add a URL path segment (security review L2)", async () => {
    const store = fakeStore();
    const trickyPublication = { ...publication, id: "pub/evil", article_id: "article/evil" };
    const trickyArticle = { ...article, id: "article/evil" };
    const requestedPaths: string[] = [];

    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      requestedPaths.push(url);
      if (url.endsWith("/api/v1/publications?channel=website&due=true")) {
        return jsonResponse({ data: [trickyPublication], next_cursor: null });
      }
      if (url.endsWith("/api/v1/articles/article%2Fevil")) {
        return jsonResponse(trickyArticle);
      }
      if (url.endsWith("/api/v1/publications/pub%2Fevil") && init?.method === "PATCH") {
        return jsonResponse({ ...trickyPublication, status: "published" });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const summary = await pullDuePublications({
      apiUrl: "https://api.scatterpost.io",
      apiKey: "test-fixture-api-key",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      store,
      buildUrl: (slug) => `https://founder.example.com/blog/${slug}`,
    });

    expect(summary).toEqual({ checked: 1, published: 1, failed: 0, errors: [] });
    expect(requestedPaths.some((url) => url.includes("article%2Fevil"))).toBe(true);
    expect(requestedPaths.some((url) => url.includes("/articles/article/evil"))).toBe(false);
  });

  it("falls back to a post-<id> slug when the title has no ASCII letters or digits (security review M1)", async () => {
    const store = fakeStore();
    const emojiPublication = { ...publication, idempotency_key: "idem-emoji-1-extra" };
    const emojiArticle = { ...article, title: "\u{1F680}\u{1F389}" };

    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/api/v1/publications?channel=website&due=true")) {
        return jsonResponse({ data: [emojiPublication], next_cursor: null });
      }
      if (url.endsWith("/api/v1/articles/article_1")) {
        return jsonResponse(emojiArticle);
      }
      if (url.endsWith("/api/v1/publications/pub_1") && init?.method === "PATCH") {
        return jsonResponse({ ...emojiPublication, status: "published" });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const summary = await pullDuePublications({
      apiUrl: "https://api.scatterpost.io",
      apiKey: "test-fixture-api-key",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      store,
      buildUrl: (slug) => `https://founder.example.com/blog/${slug}`,
    });

    expect(summary.published).toBe(1);
    expect(store.saved[0]?.slug).toBe("post-idem-emoji-1");
  });

  it("does nothing when there are no due publications", async () => {
    const store = fakeStore();
    const fetchImpl = vi.fn(async () => jsonResponse({ data: [], next_cursor: null }));

    const summary = await pullDuePublications({
      apiUrl: "https://api.scatterpost.io",
      apiKey: "test-fixture-api-key",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      store,
      buildUrl: (slug) => `https://founder.example.com/blog/${slug}`,
    });

    expect(summary).toEqual({ checked: 0, published: 0, failed: 0, errors: [] });
  });
});
