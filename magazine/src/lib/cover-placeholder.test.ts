import { describe, expect, it } from "vitest";
import { coverPlaceholder } from "./cover-placeholder.ts";

describe("coverPlaceholder", () => {
  it("echoes the given kicker as the label", () => {
    expect(coverPlaceholder("Product").label).toBe("Product");
  });

  it("falls back to Dispatch for an untagged post", () => {
    expect(coverPlaceholder("").label).toBe("Dispatch");
  });

  it("never throws on unusual characters", () => {
    expect(() => coverPlaceholder("日本語 / emoji 🚀 / punctuation!?")).not.toThrow();
  });
});
