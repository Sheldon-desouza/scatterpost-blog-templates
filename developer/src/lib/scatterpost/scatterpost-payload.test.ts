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
});
