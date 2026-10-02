import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
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

/** Depth-first search of a React element tree for the first host element
 * of the given `type` (e.g. "img"), returning its props. No renderer
 * involved: this template has no DOM test harness, so the element tree
 * React Server Components return is inspected directly instead. */
function findElement(node: ReactNode, type: string): Record<string, unknown> | undefined {
  if (node == null || typeof node !== "object") return undefined;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, type);
      if (found) return found;
    }
    return undefined;
  }
  const element = node as { type?: unknown; props?: { children?: ReactNode } };
  if (element.type === type) return element.props as Record<string, unknown>;
  if (element.props?.children !== undefined) return findElement(element.props.children, type);
  return undefined;
}

const { default: BlogPostPage } = await import("./page.tsx");

describe("blog post page", () => {
  it("uses coverImageAlt (via post.coverAlt) as the cover image's alt text", async () => {
    const element = await BlogPostPage({ params: Promise.resolve({ slug: "hello-world" }) });
    const img = findElement(element, "img");

    expect(img?.alt).toBe("A chart of launch day traffic.");
  });
});
