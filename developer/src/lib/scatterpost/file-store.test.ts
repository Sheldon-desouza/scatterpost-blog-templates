import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FileStore } from "./file-store.ts";
import type { StoredPost } from "./content-store.ts";

let dir: string;
let store: FileStore;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "blog-starter-test-"));
  store = new FileStore(dir);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

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

describe("FileStore", () => {
  it("returns an empty list before any post is written", async () => {
    expect(await store.list()).toEqual([]);
  });

  it("round trips a post through save, get and list", async () => {
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
    await store.save(post({ title: "First version" }));
    await store.save(post({ title: "Second version" }));

    const list = await store.list();
    expect(list).toHaveLength(1);
    expect(list[0]?.title).toBe("Second version");
  });

  it("suffixes the slug on a collision with a different post, never overwriting it", async () => {
    await store.save(post({ scatterpostId: "post_1", title: "Original post" }));

    const { slug } = await store.save(post({ scatterpostId: "post_2", title: "A different post" }));
    expect(slug).toBe("hello-world-2");

    const original = await store.get("hello-world");
    expect(original?.title).toBe("Original post");

    const second = await store.get("hello-world-2");
    expect(second?.title).toBe("A different post");
  });

  it("keeps suffixing past -2 when both slugs are already taken by other posts", async () => {
    await store.save(post({ scatterpostId: "post_1" }));
    await store.save(post({ scatterpostId: "post_2" }));

    const { slug } = await store.save(post({ scatterpostId: "post_3" }));
    expect(slug).toBe("hello-world-3");
  });

  it("never evaluates a gray-matter ---js front matter block (security review L9)", async () => {
    const pwnedMarker = "__scatterpost_blog_templates_l9_test_pwned__";
    delete (globalThis as Record<string, unknown>)[pwnedMarker];

    await writeFile(
      path.join(dir, "evil.md"),
      `---js\nglobalThis.${pwnedMarker} = true\n---\nBody text.\n`,
      "utf8",
    );

    const fetched = await store.get("evil");

    expect(fetched).toBeNull();
    expect((globalThis as Record<string, unknown>)[pwnedMarker]).toBeUndefined();
  });

  it("rejects an empty or invalid slug before writing (security review M1)", async () => {
    await expect(store.save(post({ slug: "" }))).rejects.toThrow(/invalid slug/);
  });

  it("round trips a cover and its coverAlt", async () => {
    await store.save(post({ cover: "https://example.com/cover.png", coverAlt: "A chart of launch day traffic." }));

    const fetched = await store.get("hello-world");
    expect(fetched?.cover).toBe("https://example.com/cover.png");
    expect(fetched?.coverAlt).toBe("A chart of launch day traffic.");
  });

  it("leaves coverAlt undefined when a post has no cover", async () => {
    await store.save(post());

    const fetched = await store.get("hello-world");
    expect(fetched?.coverAlt).toBeUndefined();
  });
});
