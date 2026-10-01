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

  it("404s when INDEXNOW_KEY is unset", async () => {
    delete process.env.INDEXNOW_KEY;
    const response = await get("anything.txt");
    expect(response.status).toBe(404);
  });

  it("404s when the requested segment does not exactly match the key", async () => {
    process.env.INDEXNOW_KEY = "abcd1234efgh";
    const response = await get("someone-elses-key.txt");
    expect(response.status).toBe(404);
  });

  it("serves the key as plain text at the exact {key}.txt path", async () => {
    process.env.INDEXNOW_KEY = "abcd1234efgh";
    const response = await get("abcd1234efgh.txt");
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("abcd1234efgh");
    expect(response.headers.get("content-type")).toContain("text/plain");
  });
});
