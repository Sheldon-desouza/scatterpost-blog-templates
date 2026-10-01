import { afterEach, describe, expect, it } from "vitest";
import { webhookSecret } from "./site.ts";

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
