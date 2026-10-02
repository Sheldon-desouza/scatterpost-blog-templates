import { afterEach, describe, expect, it, vi } from "vitest";
import type { StoredPost } from "../lib/scatterpost/content-store.ts";

const post: StoredPost = {
  slug: "hello-world",
  scatterpostId: "post_1",
  title: "Hello world",
  date: "2026-09-27T09:00:00.000Z",
  description: "A test post.",
  tags: ["test"],
  bodyMarkdown: "# Hello\n\nBody text.",
};

vi.mock("../lib/site.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/site.ts")>()),
  getStore: () => ({ get: async () => post, list: async () => [post] }),
}));

const { default: sitemap } = await import("./sitemap.ts");
const { GET: feed } = await import("./feed.xml/route.ts");
const { GET: llms } = await import("./llms.txt/route.ts");

// A blog proxied at example.com/blog: NEXT_PUBLIC_SITE_URL carries the
// /blog, so the post URLs must not add a second one when the option is on.
describe("sitemap, feed and llms.txt post URLs (NEXT_PUBLIC_POSTS_AT_ROOT)", () => {
  const env = {
    NEXT_PUBLIC_POSTS_AT_ROOT: process.env.NEXT_PUBLIC_POSTS_AT_ROOT,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };

  afterEach(() => {
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("puts posts at <site>/<slug>, with no /blog/blog and no /blog listing entry, when on", async () => {
    process.env.NEXT_PUBLIC_POSTS_AT_ROOT = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/blog";
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain("https://example.com/blog/hello-world");
    expect(urls.some((url) => url.includes("/blog/blog"))).toBe(false);
    const xml = await (await feed()).text();
    expect(xml).toContain("https://example.com/blog/hello-world");
    expect(xml).not.toContain("/blog/blog");
    const text = await (await llms()).text();
    expect(text).toContain("(https://example.com/blog/hello-world)");
    expect(text).not.toContain("/blog/blog");
  });

  it("keeps posts at <site>/blog/<slug> and the /blog entry when off", async () => {
    delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain("https://example.com/blog");
    expect(urls).toContain("https://example.com/blog/hello-world");
    const xml = await (await feed()).text();
    expect(xml).toContain("https://example.com/blog/hello-world");
  });
});
