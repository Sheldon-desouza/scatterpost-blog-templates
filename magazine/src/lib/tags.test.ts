import { describe, expect, it } from "vitest";
import type { StoredPost } from "./scatterpost/content-store.ts";
import { collectTags, postsForTagSlug, tagNameForSlug } from "./tags.ts";

function post(overrides: Partial<StoredPost>): StoredPost {
  return {
    slug: "a-post",
    scatterpostId: "id",
    title: "A post",
    date: "2026-01-01T00:00:00.000Z",
    description: "",
    tags: [],
    bodyMarkdown: "Body.",
    ...overrides,
  };
}

const posts: StoredPost[] = [
  post({ slug: "one", title: "One", tags: ["Product Design", "scatterpost"] }),
  post({ slug: "two", title: "Two", tags: ["product design"] }),
  post({ slug: "three", title: "Three", tags: ["Launches"] }),
  post({ slug: "four", title: "Four", tags: [] }),
];

describe("collectTags", () => {
  it("collapses tags that differ only by case onto one slug", () => {
    const tags = collectTags(posts);
    const productDesign = tags.find((t) => t.slug === "product-design");
    expect(productDesign).toBeDefined();
    expect(productDesign?.count).toBe(2);
  });

  it("keeps the first-seen display name for a tag", () => {
    const tags = collectTags(posts);
    const productDesign = tags.find((t) => t.slug === "product-design");
    expect(productDesign?.tag).toBe("Product Design");
  });

  it("sorts by post count, then alphabetically", () => {
    const tags = collectTags(posts);
    expect(tags.map((t) => t.slug)).toEqual(["product-design", "launches", "scatterpost"]);
  });

  it("ignores posts with no tags and returns an empty list for none", () => {
    expect(collectTags([post({ tags: [] })])).toEqual([]);
  });
});

describe("postsForTagSlug", () => {
  it("matches posts whose tag slugifies to the requested slug", () => {
    const matches = postsForTagSlug(posts, "product-design");
    expect(matches.map((p) => p.slug).sort()).toEqual(["one", "two"]);
  });

  it("returns an empty array for an unused tag", () => {
    expect(postsForTagSlug(posts, "nonexistent")).toEqual([]);
  });
});

describe("tagNameForSlug", () => {
  it("returns the display name of the first matching post's tag", () => {
    expect(tagNameForSlug(posts, "launches")).toBe("Launches");
  });

  it("falls back to the slug itself when nothing matches", () => {
    expect(tagNameForSlug(posts, "nonexistent")).toBe("nonexistent");
  });
});
