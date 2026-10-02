import { afterEach, describe, expect, it, vi } from "vitest";

// next.config.ts reads NEXT_PUBLIC_POSTS_AT_ROOT once at load, as Next
// does at build time, so each case re-imports it.
async function loadConfig() {
  vi.resetModules();
  return (await import("./next.config.ts")).default;
}

describe("next.config redirects and rewrites (NEXT_PUBLIC_POSTS_AT_ROOT)", () => {
  const original = process.env.NEXT_PUBLIC_POSTS_AT_ROOT;

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    else process.env.NEXT_PUBLIC_POSTS_AT_ROOT = original;
  });

  it("adds no redirects when the option is off", async () => {
    delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    const config = await loadConfig();
    expect(await config.redirects?.()).toEqual([]);
  });

  it("permanently redirects /blog to / and /blog/<slug> to /<slug> when on", async () => {
    process.env.NEXT_PUBLIC_POSTS_AT_ROOT = "true";
    const config = await loadConfig();
    expect(await config.redirects?.()).toEqual([
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:slug", destination: "/:slug", permanent: true },
    ]);
  });

  it("rewrites /<key>.txt to the IndexNow key route either way", async () => {
    delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    const config = await loadConfig();
    expect(await config.rewrites?.()).toEqual([
      { source: "/:key([A-Za-z0-9-]+\\.txt)", destination: "/api/indexnow-key/:key" },
    ]);
  });
});
