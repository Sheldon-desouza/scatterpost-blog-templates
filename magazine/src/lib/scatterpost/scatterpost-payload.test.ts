import { describe, expect, it } from "vitest";
import { ScatterpostPayloadSchema } from "./scatterpost-payload.ts";

const validPayload = {
  id: "idem_001",
  idempotencyKey: "idem_001",
  title: "Ship it",
  bodyMarkdown: "# Ship it\n\nContent goes here.",
  bodyHtml: "<h1>Ship it</h1><p>Content goes here.</p>",
  tags: ["launch"],
  publishedAt: "2026-09-27T09:00:00.000Z",
};

describe("ScatterpostPayloadSchema", () => {
  it("accepts a valid payload", () => {
    expect(ScatterpostPayloadSchema.safeParse(validPayload).success).toBe(true);
  });

  it("accepts optional canonicalUrl and coverImageUrl", () => {
    const result = ScatterpostPayloadSchema.safeParse({
      ...validPayload,
      canonicalUrl: "https://example.com/blog/ship-it",
      coverImageUrl: "https://example.com/cover.png",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing title", () => {
    const withoutTitle: Partial<typeof validPayload> = { ...validPayload };
    delete withoutTitle.title;
    expect(ScatterpostPayloadSchema.safeParse(withoutTitle).success).toBe(false);
  });

  it("rejects an empty bodyMarkdown", () => {
    expect(ScatterpostPayloadSchema.safeParse({ ...validPayload, bodyMarkdown: "" }).success).toBe(false);
  });

  it("rejects a non-array tags field", () => {
    expect(ScatterpostPayloadSchema.safeParse({ ...validPayload, tags: "launch" }).success).toBe(false);
  });

  it("rejects a non-url canonicalUrl", () => {
    expect(ScatterpostPayloadSchema.safeParse({ ...validPayload, canonicalUrl: "not-a-url" }).success).toBe(false);
  });

  it("rejects a javascript: canonicalUrl (security review L5)", () => {
    expect(ScatterpostPayloadSchema.safeParse({ ...validPayload, canonicalUrl: "javascript:alert(1)" }).success).toBe(
      false,
    );
  });

  it("accepts an http: canonicalUrl so a site without https yet is not blocked from publishing (security re-review N2)", () => {
    const result = ScatterpostPayloadSchema.safeParse({
      ...validPayload,
      canonicalUrl: "http://example.com/blog/ship-it",
    });
    expect(result.success).toBe(true);
    expect(result.success && result.data.canonicalUrl).toBe("http://example.com/blog/ship-it");
  });

  it("accepts an http: coverImageUrl (security re-review N2)", () => {
    const result = ScatterpostPayloadSchema.safeParse({
      ...validPayload,
      coverImageUrl: "http://example.com/cover.png",
    });
    expect(result.success).toBe(true);
    expect(result.success && result.data.coverImageUrl).toBe("http://example.com/cover.png");
  });

  it("drops a javascript: coverImageUrl to undefined rather than failing the whole payload (security re-review N2)", () => {
    const result = ScatterpostPayloadSchema.safeParse({ ...validPayload, coverImageUrl: "javascript:alert(1)" });
    expect(result.success).toBe(true);
    expect(result.success && result.data.coverImageUrl).toBeUndefined();
  });

  it("accepts an optional coverImageAlt, trimmed", () => {
    const result = ScatterpostPayloadSchema.safeParse({
      ...validPayload,
      coverImageUrl: "https://example.com/cover.png",
      coverImageAlt: "  A chart showing launch day traffic.  ",
    });
    expect(result.success).toBe(true);
    expect(result.success && result.data.coverImageAlt).toBe("A chart showing launch day traffic.");
  });

  it("rejects a coverImageAlt over 300 characters", () => {
    const result = ScatterpostPayloadSchema.safeParse({ ...validPayload, coverImageAlt: "a".repeat(301) });
    expect(result.success).toBe(false);
  });

  it("accepts a coverImageAlt of exactly 300 characters", () => {
    const result = ScatterpostPayloadSchema.safeParse({ ...validPayload, coverImageAlt: "a".repeat(300) });
    expect(result.success).toBe(true);
  });
});
