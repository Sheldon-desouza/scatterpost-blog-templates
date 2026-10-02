import { describe, expect, it } from "vitest";
import { DemoContentStore } from "./demo-content-store.ts";
import type { ContentStore, SaveResult, StoredPost } from "./content-store.ts";

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

function fakeStore(initial: StoredPost[] = []): ContentStore {
  const posts = new Map(initial.map((p) => [p.slug, p]));
  return {
    list: async () => [...posts.values()],
    get: async (slug: string) => posts.get(slug) ?? null,
    save: async (p: StoredPost): Promise<SaveResult> => {
      posts.set(p.slug, p);
      return { slug: p.slug, created: true };
    },
  };
}

describe("DemoContentStore", () => {
  it("lists demo posts alongside the real store's posts", async () => {
    const real = fakeStore([post({ slug: "real-post", date: "2026-09-01T00:00:00.000Z" })]);
    const demo = fakeStore([post({ slug: "demo-post", date: "2026-09-15T00:00:00.000Z" })]);
    const store = new DemoContentStore(real, demo);

    const posts = await store.list();
    expect(posts.map((p) => p.slug).sort()).toEqual(["demo-post", "real-post"]);
  });

  it("reads a demo post by slug when there is no real post with that slug", async () => {
    const real = fakeStore([post({ slug: "shared-slug", title: "Real" })]);
    const demo = fakeStore([post({ slug: "demo-only", title: "Demo" })]);
    const store = new DemoContentStore(real, demo);

    expect((await store.get("demo-only"))?.title).toBe("Demo");
    expect((await store.get("shared-slug"))?.title).toBe("Real");
    expect(await store.get("missing")).toBeNull();
  });

  it("never lets a demo post shadow a real post with the same slug", async () => {
    const real = fakeStore([post({ slug: "shared-slug", title: "Real" })]);
    const demo = fakeStore([post({ slug: "shared-slug", title: "Demo" })]);
    const store = new DemoContentStore(real, demo);

    expect((await store.get("shared-slug"))?.title).toBe("Real");

    const posts = await store.list();
    expect(posts).toHaveLength(1);
    expect(posts[0]?.title).toBe("Real");
  });

  it("always writes to the real store, never the demo one", async () => {
    const real = fakeStore();
    const demo = fakeStore();
    const store = new DemoContentStore(real, demo);

    await store.save(post({ slug: "new-post" }));

    expect(await real.get("new-post")).not.toBeNull();
    expect(await demo.get("new-post")).toBeNull();
  });

  it("hides the bundled starter sample from the real store when listing", async () => {
    const real = fakeStore([
      post({ slug: "hello-world", scatterpostId: "sample-hello-world" }),
      post({ slug: "real-post", scatterpostId: "idem_1", date: "2026-09-01T00:00:00.000Z" }),
    ]);
    const demo = fakeStore([post({ slug: "demo-post", scatterpostId: "demo_1", date: "2026-09-15T00:00:00.000Z" })]);
    const store = new DemoContentStore(real, demo);

    const posts = await store.list();
    expect(posts.map((p) => p.slug).sort()).toEqual(["demo-post", "real-post"]);
  });

  it("hides the bundled starter sample from the real store when read by slug", async () => {
    const real = fakeStore([post({ slug: "hello-world", scatterpostId: "sample-hello-world" })]);
    const demo = fakeStore();
    const store = new DemoContentStore(real, demo);

    expect(await store.get("hello-world")).toBeNull();
  });

  it('still lists a real post whose id does not start with "sample-"', async () => {
    const real = fakeStore([post({ slug: "real-post", scatterpostId: "idem_1" })]);
    const demo = fakeStore();
    const store = new DemoContentStore(real, demo);

    const posts = await store.list();
    expect(posts.map((p) => p.slug)).toEqual(["real-post"]);
  });

  it('still reads a real post whose id does not start with "sample-"', async () => {
    const real = fakeStore([post({ slug: "real-post", scatterpostId: "idem_1", title: "Real" })]);
    const demo = fakeStore();
    const store = new DemoContentStore(real, demo);

    expect((await store.get("real-post"))?.title).toBe("Real");
  });
});
