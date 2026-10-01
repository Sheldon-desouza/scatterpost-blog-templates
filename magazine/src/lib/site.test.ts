import { afterEach, describe, expect, it } from "vitest";
import { sameAsUrls, webhookSecret } from "./site.ts";

describe("webhookSecret (security review L3)", () => {
  const original = process.env.SCATTERPOST_WEBHOOK_SECRET;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.SCATTERPOST_WEBHOOK_SECRET;
    } else {
      process.env.SCATTERPOST_WEBHOOK_SECRET = original;
    }
  });

  it("throws when unset", () => {
    delete process.env.SCATTERPOST_WEBHOOK_SECRET;
    expect(() => webhookSecret()).toThrow(/not set/);
  });

  it("throws when shorter than 32 characters", () => {
    process.env.SCATTERPOST_WEBHOOK_SECRET = "too-short";
    expect(() => webhookSecret()).toThrow(/at least 32 characters/);
  });

  it("accepts a secret of exactly 32 characters", () => {
    process.env.SCATTERPOST_WEBHOOK_SECRET = "a".repeat(32);
    expect(webhookSecret()).toBe("a".repeat(32));
  });
});

describe("sameAsUrls", () => {
  const original = process.env.SAME_AS;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.SAME_AS;
    } else {
      process.env.SAME_AS = original;
    }
  });

  it("returns an empty list when unset", () => {
    delete process.env.SAME_AS;
    expect(sameAsUrls()).toEqual([]);
  });

  it("splits a comma-separated list of https URLs", () => {
    process.env.SAME_AS = "https://example.com/a, https://example.com/b";
    expect(sameAsUrls()).toEqual(["https://example.com/a", "https://example.com/b"]);
  });

  it("drops an entry that is not a valid https URL", () => {
    process.env.SAME_AS = "https://example.com/a, not-a-url, http://example.com/insecure";
    expect(sameAsUrls()).toEqual(["https://example.com/a"]);
  });
});
