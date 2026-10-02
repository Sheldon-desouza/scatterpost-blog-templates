import { describe, expect, it } from "vitest";
import { coverPlaceholder } from "./cover-placeholder.ts";

describe("coverPlaceholder", () => {
  it("uppercases the title's first letter", () => {
    expect(coverPlaceholder("Product update").letter).toBe("P");
  });

  it("falls back to a generic glyph for an empty title", () => {
    expect(coverPlaceholder("").letter).toBe("?");
  });

  it("trims leading whitespace before taking the first letter", () => {
    expect(coverPlaceholder("  launch day").letter).toBe("L");
  });

  it("takes one whole character even when the title starts with an emoji (a surrogate pair)", () => {
    expect(coverPlaceholder("🚀 Launch day").letter).toBe("🚀");
  });

  it("never throws on unusual characters", () => {
    expect(() => coverPlaceholder("日本語 / emoji 🚀 / punctuation!?")).not.toThrow();
  });
});
