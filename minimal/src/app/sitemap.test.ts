import { afterEach, describe, expect, it } from "vitest";
import sitemap from "./sitemap.ts";

// Demo mode serves this template under a path (e.g. "/minimal") on
// demo.scatterpost.io, baked into NEXT_PUBLIC_SITE_URL rather than into
// `basePath` alone (see next.config.ts); every absolute URL this route
// emits must carry that path through, or a crawler following the
// sitemap would land one level too high.
describe("sitemap with a demo-mode base path", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = original;
    }
  });

  it("keeps every entry's URL under the configured base path", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://demo.scatterpost.io/minimal";
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.url.startsWith("https://demo.scatterpost.io/minimal")).toBe(true);
    }
  });
});
