import { describe, expect, it } from "vitest";
import { verifySignature } from "./verify-signature.ts";
import { createHmac } from "node:crypto";

const secret = "a-random-string-at-least-32-characters-long";

function sign(body: string, timestamp: number): string {
  const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return `t=${timestamp},v1=${digest}`;
}

describe("verifySignature", () => {
  it("accepts a valid, fresh signature", () => {
    const body = JSON.stringify({ title: "Hello" });
    const now = () => new Date("2026-09-27T09:00:00.000Z");
    const timestamp = Math.floor(now().getTime() / 1000);
    const header = sign(body, timestamp);
    expect(verifySignature(secret, header, body, { now })).toBe(true);
  });

  it("rejects an expired timestamp", () => {
    const body = JSON.stringify({ title: "Hello" });
    const timestamp = Math.floor(new Date("2026-09-27T09:00:00.000Z").getTime() / 1000);
    const header = sign(body, timestamp);
    const laterNow = () => new Date("2026-09-27T09:10:00.000Z"); // 10 minutes later
    expect(verifySignature(secret, header, body, { now: laterNow })).toBe(false);
  });

  it("rejects a tampered body", () => {
    const now = () => new Date("2026-09-27T09:00:00.000Z");
    const timestamp = Math.floor(now().getTime() / 1000);
    const header = sign(JSON.stringify({ title: "Hello" }), timestamp);
    const tamperedBody = JSON.stringify({ title: "Goodbye" });
    expect(verifySignature(secret, header, tamperedBody, { now })).toBe(false);
  });

  it("rejects a wrong secret", () => {
    const now = () => new Date("2026-09-27T09:00:00.000Z");
    const timestamp = Math.floor(now().getTime() / 1000);
    const body = JSON.stringify({ title: "Hello" });
    const header = sign(body, timestamp);
    expect(verifySignature("a-different-secret-at-least-32-chars", header, body, { now })).toBe(false);
  });

  it("rejects a malformed header", () => {
    expect(verifySignature(secret, "not-a-real-header", "{}")).toBe(false);
  });
});
