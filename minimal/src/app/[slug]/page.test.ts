import { afterEach, describe, expect, it, vi } from "vitest";
import type { StoredPost } from "../../lib/scatterpost/content-store.ts";

const post: StoredPost = {
  slug: "hello-world",
  scatterpostId: "post_1",
  title: "Hello world",
  date: "2026-09-27T09:00:00.000Z",
  description: "A test post.",
  tags: ["test"],
  bodyMarkdown: "# Hello\n\nBody text.",
};

// Only the store is faked: postUrl and siteUrl are the real ones, so
// this checks the canonical a post at the root actually gets.
vi.mock("../../lib/site.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/site.ts")>()),
  getStore: () => ({ get: async () => post, list: async () => [post] }),
}));

const { default: RootPostPage, generateMetadata } = await import("./page.tsx");
const { generateMetadata: generateBlogPostMetadata } = await import("../blog/[slug]/page.tsx");

const NOT_FOUND_DIGEST_PATTERN = /HTTP_ERROR_FALLBACK;404/;
const params = Promise.resolve({ slug: "hello-world" });

describe("/[slug] (NEXT_PUBLIC_POSTS_AT_ROOT)", () => {
  const originalOption = process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
  const originalSite = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    for (const [key, value] of [
      ["NEXT_PUBLIC_POSTS_AT_ROOT", originalOption],
      ["NEXT_PUBLIC_SITE_URL", originalSite],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("calls notFound() and returns no metadata when the option is off", async () => {
    delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    await expect(RootPostPage({ params })).rejects.toThrow(NOT_FOUND_DIGEST_PATTERN);
    expect(await generateMetadata({ params })).toEqual({});
  });

  it("uses <site>/<slug> as the canonical when the option is on, for a blog served under /blog", async () => {
    process.env.NEXT_PUBLIC_POSTS_AT_ROOT = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/blog";
    const metadata = await generateMetadata({ params });
    expect(metadata.alternates?.canonical).toBe("https://example.com/blog/hello-world");
    expect(metadata.openGraph?.url).toBe("https://example.com/blog/hello-world");
  });

  it("renders the post when the option is on", async () => {
    process.env.NEXT_PUBLIC_POSTS_AT_ROOT = "true";
    await expect(RootPostPage({ params })).resolves.toBeTruthy();
  });
});

describe("post metadata og:image and twitter:image", () => {
  const originalOption = process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
  const originalSite = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    for (const [key, value] of [
      ["NEXT_PUBLIC_POSTS_AT_ROOT", originalOption],
      ["NEXT_PUBLIC_SITE_URL", originalSite],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  function imageUrls(metadata: Awaited<ReturnType<typeof generateMetadata>>): string[] {
    const toUrls = (images: unknown) =>
      (Array.isArray(images) ? images : [images]).map((image) => String((image as { url: string }).url));
    return [...toUrls(metadata.openGraph?.images), ...toUrls(metadata.twitter?.images)];
  }

  it("points at <site>/<slug>/opengraph-image, base path included, when the option is on", async () => {
    process.env.NEXT_PUBLIC_POSTS_AT_ROOT = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/blog";
    expect(imageUrls(await generateMetadata({ params }))).toEqual([
      "https://example.com/blog/hello-world/opengraph-image",
      "https://example.com/blog/hello-world/opengraph-image",
    ]);
  });

  it("points at <site>/blog/<slug>/opengraph-image, base path included, when the option is off", async () => {
    delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    process.env.NEXT_PUBLIC_SITE_URL = "https://demo.scatterpost.io/minimal";
    expect(imageUrls(await generateBlogPostMetadata({ params }))).toEqual([
      "https://demo.scatterpost.io/minimal/blog/hello-world/opengraph-image",
      "https://demo.scatterpost.io/minimal/blog/hello-world/opengraph-image",
    ]);
  });
});
