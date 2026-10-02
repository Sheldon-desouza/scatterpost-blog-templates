import { describe, expect, it } from "vitest";
import { isValidSlug } from "./safe-html.ts";
import { ReservedSlugError, slugify, slugifyWithFallback } from "./slugify.ts";

describe("slugify", () => {
  it("lowercases, trims and hyphenates a normal title", () => {
    expect(slugify("Ship It!  Right Now")).toBe("ship-it-right-now");
  });

  it("caps a long title at about 80 characters, cut at a hyphen (security re-review N3)", () => {
    const longTitle = Array.from({ length: 30 }, (_, i) => `word${i}`).join(" ");
    const slug = slugify(longTitle);
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith("-")).toBe(false);
    // Cutting mid-word would leave a fragment of the next word stuck to
    // the last whole one; every surviving token should be a complete
    // "word<N>" from the title.
    expect(slug.split("-").every((token) => /^word\d+$/.test(token))).toBe(true);
  });

  it("leaves enough room that a collision suffix never pushes the slug past isValidSlug's 200-character limit (security re-review N3)", () => {
    const longTitle = "x ".repeat(500);
    const slug = slugify(longTitle);
    const withSuffix = `${slug}-999999`;
    expect(isValidSlug(withSuffix)).toBe(true);
  });
});

describe("slugifyWithFallback", () => {
  it("falls back to post-<id> for a title with no ASCII letters or digits (security review M1)", () => {
    expect(slugifyWithFallback("\u{1F680}\u{1F389}", "idem-emoji-1-extra")).toBe("post-idem-emoji-1");
  });
});

describe("reserved slugs (NEXT_PUBLIC_POSTS_AT_ROOT)", () => {
  const reserved = new Set(["blog", "api", "tags"]);

  it("throws a ReservedSlugError naming the slug when a title slugifies to a reserved one", () => {
    expect(() => slugify("Blog", { reserved })).toThrow(ReservedSlugError);
    expect(() => slugify("  API! ", { reserved })).toThrow(/"api", which is reserved/);
  });

  it("allows a slug that only contains a reserved word", () => {
    expect(slugify("Blog post ideas", { reserved })).toBe("blog-post-ideas");
    expect(slugify("Tags", { reserved: new Set() })).toBe("tags");
  });

  it("is unchanged when no reserved set is passed (the option is off)", () => {
    expect(slugify("Blog")).toBe("blog");
    expect(slugifyWithFallback("Tags", "idem-1")).toBe("tags");
  });

  it("refuses through slugifyWithFallback too", () => {
    expect(() => slugifyWithFallback("Tags", "idem-1", { reserved })).toThrow(ReservedSlugError);
  });
});
