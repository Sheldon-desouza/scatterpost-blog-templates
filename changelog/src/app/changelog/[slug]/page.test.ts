import { describe, expect, it, vi } from "vitest";
import type { StoredPost } from "../../../lib/scatterpost/content-store.ts";

const post: StoredPost = {
  slug: "hello-world",
  scatterpostId: "post_1",
  title: "Hello world",
  date: "2026-09-27T09:00:00.000Z",
  description: "A test post.",
  tags: ["changelog"],
  cover: "https://example.com/cover.png",
  coverAlt: "A chart of launch day traffic.",
  bodyMarkdown: "# Hello\n\nBody text.",
};

let current: StoredPost = post;

vi.mock("../../../lib/site.ts", () => ({
  authorName: () => "Jane Doe",
  authorUrl: () => undefined,
  changelogUrl: (slug: string) => `https://example.com/changelog/${slug}`,
  getStore: () => ({ get: async () => current, list: async () => [current] }),
  postUrl: (slug: string) => `https://example.com/blog/${slug}`,
  siteName: () => "My blog",
  siteUrl: () => "https://example.com",
}));

const { generateMetadata } = await import("./page.tsx");

describe("changelog entry generateMetadata", () => {
  it("uses coverImageAlt (via post.coverAlt) as og:image:alt and twitter:image:alt", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "hello-world" }) });

    expect(metadata.openGraph?.images).toEqual([
      { url: "https://example.com/cover.png", alt: "A chart of launch day traffic." },
    ]);
    expect(metadata.twitter?.images).toEqual([
      { url: "https://example.com/cover.png", alt: "A chart of launch day traffic." },
    ]);
  });

  it("falls back to the entry's own opengraph-image, as an absolute URL, when there is no cover", async () => {
    current = { ...post, cover: undefined, coverAlt: undefined };
    try {
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: "hello-world" }) });
      const expected = [
        { url: "https://example.com/changelog/hello-world/opengraph-image", width: 1200, height: 630, alt: "Hello world" },
      ];
      expect(metadata.openGraph?.images).toEqual(expected);
      expect(metadata.twitter?.images).toEqual(expected);
    } finally {
      current = post;
    }
  });
});
