import { afterEach, describe, expect, it } from "vitest";
import { GET } from "./route.ts";

// Same base-path concern as sitemap.test.ts: the RSS `<link>` and every
// item's `<guid>`/`<link>` must carry a configured demo-mode base path
// through, since a reader's feed client resolves them as absolute URLs.
describe("GET /feed.xml with a demo-mode base path", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = original;
    }
  });

  it("keeps the channel link and item links under the configured base path", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://demo.scatterpost.io/minimal";
    const response = await GET();
    const xml = await response.text();
    expect(xml).toContain("<link>https://demo.scatterpost.io/minimal</link>");
    expect(xml).not.toMatch(/<link>https:\/\/demo\.scatterpost\.io\/blog/);
  });
});
