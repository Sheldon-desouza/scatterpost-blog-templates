import { describe, expect, it } from "vitest";
import { readingTimeMinutes } from "./reading-time.ts";

describe("readingTimeMinutes", () => {
  it("rounds up to the nearest minute", () => {
    expect(readingTimeMinutes("word ".repeat(201))).toBe(2);
  });

  it("never reports less than one minute", () => {
    expect(readingTimeMinutes("a few words")).toBe(1);
    expect(readingTimeMinutes("")).toBe(1);
  });
});
