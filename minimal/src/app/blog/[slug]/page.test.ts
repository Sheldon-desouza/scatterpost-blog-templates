import { describe, expect, it, vi } from "vitest";
import type { StoredPost } from "../../../lib/scatterpost/content-store.ts";

const post: StoredPost = {
  slug: "hello-world",
  scatterpostId: "post_1",
  title: "Hello world",
  date: "2026-09-27T09:00:00.000Z",
  description: "A test post.",
  tags: ["test"],
  cover: "https://example.com/cover.png",
  coverAlt: "A chart of launch day traffic.",
  bodyMarkdown: "# Hello\n\nBody text.",
};

vi.mock("../../../lib/site.ts", () => ({
  authorName: () => "Jane Doe",
  authorUrl: () => undefined,
  getStore: () => ({ get: async () => post, list: async () => [post] }),
  postUrl: (slug: string) => `https://example.com/blog/${slug}`,
  siteName: () => "My blog",
  siteUrl: () => "https://example.com",
}));

const { generateMetadata } = await import("./page.tsx");

describe("blog post generateMetadata", () => {
  it("uses coverImageAlt (via post.coverAlt) as og:image:alt and twitter:image:alt", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "hello-world" }) });

    expect(metadata.openGraph?.images).toEqual([
      { url: "https://example.com/cover.png", alt: "A chart of launch day traffic." },
    ]);
    expect(metadata.twitter?.images).toEqual([
      { url: "https://example.com/cover.png", alt: "A chart of launch day traffic." },
    ]);
  });

  it("omits the alt key when coverAlt is absent, matching existing behaviour", async () => {
    const withoutAlt = { ...post, coverAlt: undefined };
    vi.doMock("../../../lib/site.ts", () => ({
      authorName: () => "Jane Doe",
      authorUrl: () => undefined,
      getStore: () => ({ get: async () => withoutAlt, list: async () => [withoutAlt] }),
      postUrl: (slug: string) => `https://example.com/blog/${slug}`,
      siteName: () => "My blog",
      siteUrl: () => "https://example.com",
    }));
    vi.resetModules();
    const { generateMetadata: generateMetadataWithoutAlt } = await import("./page.tsx");

    const metadata = await generateMetadataWithoutAlt({ params: Promise.resolve({ slug: "hello-world" }) });

    expect(metadata.openGraph?.images).toEqual([{ url: "https://example.com/cover.png" }]);
    expect(metadata.twitter?.images).toEqual([{ url: "https://example.com/cover.png" }]);
  });
});
