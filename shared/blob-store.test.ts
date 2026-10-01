import { describe, expect, it, vi } from "vitest";
import type { StoredPost } from "./content-store.ts";

const objects = new Map<string, string>();

vi.mock("@vercel/blob", () => ({
  put: vi.fn(async (pathname: string, body: string) => {
    objects.set(pathname, body);
    return { url: `https://example.private.blob.vercel-storage.com/${pathname}`, pathname };
  }),
  get: vi.fn(async (pathname: string) => {
    const body = objects.get(pathname);
    if (body === undefined) return null;
    return {
      statusCode: 200,
      stream: new Response(body).body,
      headers: new Headers(),
      blob: { pathname, contentType: "text/markdown", size: body.length },
    };
  }),
  list: vi.fn(async ({ prefix }: { prefix?: string }) => ({
    blobs: [...objects.keys()]
      .filter((pathname) => !prefix || pathname.startsWith(prefix))
      .map((pathname) => ({ pathname, url: `https://example/${pathname}` })),
    hasMore: false,
  })),
  del: vi.fn(async (pathname: string) => {
    objects.delete(pathname);
  }),
}));

const { BlobStore } = await import("./blob-store.ts");

function post(overrides: Partial<StoredPost> = {}): StoredPost {
  return {
    slug: "hello-world",
    scatterpostId: "post_1",
    title: "Hello world",
    date: "2026-09-27T09:00:00.000Z",
    description: "A test post.",
    tags: ["test"],
    bodyMarkdown: "# Hello\n\nBody text.",
    ...overrides,
  };
}

describe("BlobStore", () => {
  it("returns an empty list before any post is written", async () => {
    objects.clear();
    const store = new BlobStore();
    expect(await store.list()).toEqual([]);
  });

  it("round trips a post through save, get and list", async () => {
    objects.clear();
    const store = new BlobStore();
    const { slug } = await store.save(post());
    expect(slug).toBe("hello-world");

    const fetched = await store.get("hello-world");
    expect(fetched).toMatchObject({
      slug: "hello-world",
      title: "Hello world",
      description: "A test post.",
      tags: ["test"],
      bodyMarkdown: "# Hello\n\nBody text.",
    });

    const list = await store.list();
    expect(list).toHaveLength(1);
    expect(list[0]?.slug).toBe("hello-world");
  });

  it("overwrites a post with the same scatterpostId at the same slug", async () => {
    objects.clear();
    const store = new BlobStore();
    await store.save(post({ title: "First version" }));
    await store.save(post({ title: "Second version" }));

    const list = await store.list();
    expect(list).toHaveLength(1);
    expect(list[0]?.title).toBe("Second version");
  });

  it("suffixes the slug on a collision with a different post, never overwriting it", async () => {
    objects.clear();
    const store = new BlobStore();
    await store.save(post({ scatterpostId: "post_1", title: "Original post" }));

    const { slug } = await store.save(post({ scatterpostId: "post_2", title: "A different post" }));
    expect(slug).toBe("hello-world-2");

    const original = await store.get("hello-world");
    expect(original?.title).toBe("Original post");

    const second = await store.get("hello-world-2");
    expect(second?.title).toBe("A different post");
  });

  it("never reaches a blob pathname outside the posts prefix for a traversal slug", async () => {
    objects.clear();
    const store = new BlobStore();
    expect(await store.get("../../secret")).toBeNull();
  });
});
