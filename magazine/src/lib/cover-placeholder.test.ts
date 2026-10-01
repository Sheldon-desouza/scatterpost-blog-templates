import { describe, expect, it } from "vitest";
import { coverPlaceholder } from "./cover-placeholder.ts";

describe("coverPlaceholder", () => {
  it("is deterministic for the same title", () => {
    const first = coverPlaceholder("Why we rebuilt our pricing page");
    const second = coverPlaceholder("Why we rebuilt our pricing page");
    expect(first).toEqual(second);
  });

  it("produces a two-stop linear gradient", () => {
    const { background } = coverPlaceholder("Shipping faster with agents");
    expect(background).toMatch(/^linear-gradient\(135deg, hsl\(\d+ \d+% \d+%\), hsl\(\d+ \d+% \d+%\)\)$/);
  });

  it("tends to differ between different titles", () => {
    const a = coverPlaceholder("Our Q1 roadmap");
    const b = coverPlaceholder("A completely different post");
    expect(a.background).not.toEqual(b.background);
  });

  it("takes up to the first three words as the label", () => {
    const { label } = coverPlaceholder("One two three four five");
    expect(label).toBe("One two three");
  });

  it("falls back to Untitled for an empty title", () => {
    expect(coverPlaceholder("").label).toBe("Untitled");
    expect(coverPlaceholder("   ").label).toBe("Untitled");
  });

  it("never throws on titles with unusual characters", () => {
    expect(() => coverPlaceholder("日本語 / emoji 🚀 / punctuation!?")).not.toThrow();
  });
});
