import { describe, expect, it } from "vitest";
import { resolveSlugAndWrite, type StoredPost } from "./content-store.ts";

function post(overrides: Partial<StoredPost> = {}): StoredPost {
  return {
    slug: "hello-world",
    scatterpostId: "idem_1",
    title: "Hello world",
    date: "2026-09-27T09:00:00.000Z",
    description: "",
    tags: [],
    bodyMarkdown: "Body text.",
    ...overrides,
  };
}

function fakeBackend() {
  const written = new Map<string, StoredPost>();
  return {
    written,
    getExisting: async (slug: string) => written.get(slug) ?? null,
    write: async (slug: string, resolved: StoredPost) => {
      written.set(slug, resolved);
    },
  };
}

describe("resolveSlugAndWrite", () => {
  it("refuses to write a post with an invalid slug (security review M1)", async () => {
    const backend = fakeBackend();
    await expect(
      resolveSlugAndWrite(post({ slug: "" }), backend.getExisting, backend.write),
    ).rejects.toThrow(/invalid slug/);
    expect(backend.written.size).toBe(0);
  });

  it("updates the same post, not a duplicate, when push and pull use the same stable id (noticed: push/pull id mismatch)", async () => {
    const backend = fakeBackend();

    // Push mode: scatterpost calls this site's webhook with
    // `payload.idempotencyKey` as the stable id.
    await resolveSlugAndWrite(
      post({ scatterpostId: "idem_shared_1", title: "Draft title" }),
      backend.getExisting,
      backend.write,
    );

    // Pull mode: this site later polls scatterpost for the same
    // publication, which carries the same idempotency key.
    const result = await resolveSlugAndWrite(
      post({ scatterpostId: "idem_shared_1", title: "Final title" }),
      backend.getExisting,
      backend.write,
    );

    expect(backend.written.size).toBe(1);
    expect(result.created).toBe(false);
    expect(backend.written.get("hello-world")?.title).toBe("Final title");
  });
});
