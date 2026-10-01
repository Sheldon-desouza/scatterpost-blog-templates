import { afterEach, describe, expect, it, vi } from "vitest";
import { buildIndexNowPayload, isValidIndexNowKey, pingIndexNow } from "./indexnow.ts";

describe("isValidIndexNowKey", () => {
  it("accepts 8 to 128 characters of a-z, A-Z, 0-9 and -", () => {
    expect(isValidIndexNowKey("abcd1234")).toBe(true);
    expect(isValidIndexNowKey("abcd-1234-EFGH")).toBe(true);
  });

  it("rejects unset, too short, too long or out-of-alphabet keys", () => {
    expect(isValidIndexNowKey(undefined)).toBe(false);
    expect(isValidIndexNowKey(null)).toBe(false);
    expect(isValidIndexNowKey("short")).toBe(false);
    expect(isValidIndexNowKey("a".repeat(129))).toBe(false);
    expect(isValidIndexNowKey("has a space")).toBe(false);
    expect(isValidIndexNowKey("has_underscore")).toBe(false);
  });
});

describe("buildIndexNowPayload", () => {
  it("builds host, key, keyLocation and a urlList with the post and the sitemap", () => {
    const payload = buildIndexNowPayload("https://example.com", "abcd1234efgh", "https://example.com/blog/hello");
    expect(payload).toEqual({
      host: "example.com",
      key: "abcd1234efgh",
      keyLocation: "https://example.com/abcd1234efgh.txt",
      urlList: ["https://example.com/blog/hello", "https://example.com/sitemap.xml"],
    });
  });
});

describe("pingIndexNow", () => {
  const original = process.env.INDEXNOW_KEY;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.INDEXNOW_KEY;
    } else {
      process.env.INDEXNOW_KEY = original;
    }
  });

  it("does nothing when INDEXNOW_KEY is unset", () => {
    delete process.env.INDEXNOW_KEY;
    const fetchImpl = vi.fn();
    pingIndexNow({ siteUrl: "https://example.com", postUrl: "https://example.com/blog/hello", fetchImpl });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("does nothing when INDEXNOW_KEY is malformed", () => {
    process.env.INDEXNOW_KEY = "short";
    const fetchImpl = vi.fn();
    pingIndexNow({ siteUrl: "https://example.com", postUrl: "https://example.com/blog/hello", fetchImpl });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("POSTs the payload to api.indexnow.org when a valid key is set", () => {
    process.env.INDEXNOW_KEY = "abcd1234efgh";
    const fetchImpl = vi.fn().mockResolvedValue(new Response("", { status: 200 }));
    pingIndexNow({ siteUrl: "https://example.com", postUrl: "https://example.com/blog/hello", fetchImpl });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.indexnow.org/indexnow",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("never throws, even when the ping itself rejects", async () => {
    process.env.INDEXNOW_KEY = "abcd1234efgh";
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    expect(() =>
      pingIndexNow({ siteUrl: "https://example.com", postUrl: "https://example.com/blog/hello", fetchImpl }),
    ).not.toThrow();
    // Let the rejected promise's .catch run before the test ends.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
