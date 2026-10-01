import { describe, expect, it } from "vitest";
import { isValidSlug } from "./safe-html.ts";
import { slugify, slugifyWithFallback } from "./slugify.ts";

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
