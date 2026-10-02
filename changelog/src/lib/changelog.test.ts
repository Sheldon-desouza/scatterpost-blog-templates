import { describe, expect, it } from "vitest";
import { groupByMonth, isChangelogPost, parseCategory, parseVersion, splitPosts } from "./changelog.ts";

describe("isChangelogPost", () => {
  it("is true when tags include \"changelog\"", () => {
    expect(isChangelogPost({ tags: ["changelog"] })).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isChangelogPost({ tags: ["Changelog"] })).toBe(true);
    expect(isChangelogPost({ tags: ["CHANGELOG"] })).toBe(true);
  });

  it("is false for any other tags", () => {
    expect(isChangelogPost({ tags: ["engineering", "release notes"] })).toBe(false);
  });

  it("is false with no tags", () => {
    expect(isChangelogPost({ tags: [] })).toBe(false);
  });
});

describe("splitPosts", () => {
  it("separates changelog-tagged posts from everything else", () => {
    const posts = [
      { slug: "a", tags: ["changelog"] },
      { slug: "b", tags: ["engineering"] },
      { slug: "c", tags: ["product", "Changelog"] },
      { slug: "d", tags: [] },
    ];

    const { blogPosts, changelogPosts } = splitPosts(posts);

    expect(changelogPosts.map((p) => p.slug)).toEqual(["a", "c"]);
    expect(blogPosts.map((p) => p.slug)).toEqual(["b", "d"]);
  });
});

describe("parseVersion", () => {
  it("parses a leading semver-ish version", () => {
    expect(parseVersion("v1.2.0: Faster exports")).toBe("v1.2.0");
  });

  it("parses a version without a leading v", () => {
    expect(parseVersion("2.4 - New dashboard")).toBe("2.4");
  });

  it("parses a two-part version", () => {
    expect(parseVersion("v1.2 - Smaller fixes")).toBe("v1.2");
  });

  it("returns undefined when the title has no leading version", () => {
    expect(parseVersion("Faster exports this week")).toBeUndefined();
  });

  it("does not match a version in the middle of the title", () => {
    expect(parseVersion("Shipping v1.2.0 today")).toBeUndefined();
  });
});

describe("parseCategory", () => {
  it("matches \"new\", case-insensitively", () => {
    expect(parseCategory(["changelog", "New"])).toBe("new");
  });

  it("matches \"improved\" and the \"improvement\" synonym", () => {
    expect(parseCategory(["changelog", "improved"])).toBe("improved");
    expect(parseCategory(["changelog", "Improvement"])).toBe("improved");
  });

  it("matches \"fixed\" and the \"fix\" synonym", () => {
    expect(parseCategory(["changelog", "fixed"])).toBe("fixed");
    expect(parseCategory(["changelog", "Fix"])).toBe("fixed");
  });

  it("returns undefined when no tag matches a category", () => {
    expect(parseCategory(["changelog", "scatterpost"])).toBeUndefined();
  });
});

describe("groupByMonth", () => {
  it("groups posts by calendar month, newest month first", () => {
    const posts = [
      { date: "2026-08-01T00:00:00.000Z" },
      { date: "2026-09-15T00:00:00.000Z" },
      { date: "2026-09-02T00:00:00.000Z" },
      { date: "2026-07-20T00:00:00.000Z" },
    ];

    const groups = groupByMonth(posts);

    expect(groups.map((g) => g.key)).toEqual(["2026-09", "2026-08", "2026-07"]);
    // Within September, newest first.
    expect(groups[0]?.posts.map((p) => p.date)).toEqual([
      "2026-09-15T00:00:00.000Z",
      "2026-09-02T00:00:00.000Z",
    ]);
  });

  it("gives each group a human-readable label", () => {
    const groups = groupByMonth([{ date: "2026-09-15T00:00:00.000Z" }]);
    expect(groups[0]?.label).toBe("September 2026");
  });

  it("returns an empty array for no posts", () => {
    expect(groupByMonth([])).toEqual([]);
  });
});
