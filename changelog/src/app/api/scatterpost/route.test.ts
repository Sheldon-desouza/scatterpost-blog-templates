import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route.ts";

describe("POST /api/scatterpost (security review L4)", () => {
  const original = process.env.SCATTERPOST_WEBHOOK_SECRET;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.SCATTERPOST_WEBHOOK_SECRET;
    } else {
      process.env.SCATTERPOST_WEBHOOK_SECRET = original;
    }
  });

  it("returns a generic 500 body, never the internal config error, when the webhook secret is not set", async () => {
    delete process.env.SCATTERPOST_WEBHOOK_SECRET;

    const request = new Request("https://example.com/api/scatterpost", {
      method: "POST",
      headers: { "x-scatterpost-signature": "t=1,v1=abcd" },
      body: "{}",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Server misconfigured." });
    expect(JSON.stringify(body)).not.toContain("SCATTERPOST_WEBHOOK_SECRET");
  });
});
