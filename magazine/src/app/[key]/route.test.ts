import { afterEach, describe, expect, it } from "vitest";
import { GET } from "./route.ts";

describe("GET /{key}.txt (IndexNow key file)", () => {
  const original = process.env.INDEXNOW_KEY;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.INDEXNOW_KEY;
    } else {
      process.env.INDEXNOW_KEY = original;
    }
  });

  function get(key: string): Promise<Response> {
    return GET(new Request(`https://example.com/${key}`), { params: Promise.resolve({ key }) });
  }

  // `notFound()` (security re-review LOW-1) renders the normal
  // not-found page via a thrown marker error rather than returning a
  // response directly; the digest below is how Next's own router
  // recognises it (see next/dist/client/components/not-found.js).
  const NOT_FOUND_DIGEST_PATTERN = /HTTP_ERROR_FALLBACK;404/;

  it("calls notFound() when INDEXNOW_KEY is unset", async () => {
    delete process.env.INDEXNOW_KEY;
    await expect(get("anything.txt")).rejects.toThrow(NOT_FOUND_DIGEST_PATTERN);
  });

  it("calls notFound() when the requested segment does not exactly match the key", async () => {
    process.env.INDEXNOW_KEY = "abcd1234efgh";
    await expect(get("someone-elses-key.txt")).rejects.toThrow(NOT_FOUND_DIGEST_PATTERN);
  });

  it("serves the key as plain text at the exact {key}.txt path", async () => {
    process.env.INDEXNOW_KEY = "abcd1234efgh";
    const response = await get("abcd1234efgh.txt");
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("abcd1234efgh");
    expect(response.headers.get("content-type")).toContain("text/plain");
  });
});
