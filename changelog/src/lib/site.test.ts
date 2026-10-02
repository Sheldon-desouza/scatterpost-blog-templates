import { afterEach, describe, expect, it } from "vitest";
import { authorUrl, getStore, postUrl, sameAsUrls, siteUrl, webhookSecret } from "./site.ts";

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

describe("sameAsUrls", () => {
  const original = process.env.SAME_AS;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.SAME_AS;
    } else {
      process.env.SAME_AS = original;
    }
  });

  it("returns an empty list when unset", () => {
    delete process.env.SAME_AS;
    expect(sameAsUrls()).toEqual([]);
  });

  it("splits a comma-separated list of https URLs", () => {
    process.env.SAME_AS = "https://example.com/a, https://example.com/b";
    expect(sameAsUrls()).toEqual(["https://example.com/a", "https://example.com/b"]);
  });

  it("drops an entry that is not a valid https URL", () => {
    process.env.SAME_AS = "https://example.com/a, not-a-url, http://example.com/insecure";
    expect(sameAsUrls()).toEqual(["https://example.com/a"]);
  });
});

describe("authorUrl (security re-review LOW-3)", () => {
  const original = process.env.AUTHOR_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.AUTHOR_URL;
    } else {
      process.env.AUTHOR_URL = original;
    }
  });

  it("returns undefined when unset", () => {
    delete process.env.AUTHOR_URL;
    expect(authorUrl()).toBeUndefined();
  });

  it("returns a valid https URL", () => {
    process.env.AUTHOR_URL = "https://example.com/author";
    expect(authorUrl()).toBe("https://example.com/author");
  });

  it("drops an http:// URL", () => {
    process.env.AUTHOR_URL = "http://example.com/author";
    expect(authorUrl()).toBeUndefined();
  });

  it("drops a malformed value", () => {
    process.env.AUTHOR_URL = "not-a-url";
    expect(authorUrl()).toBeUndefined();
  });
});


describe("siteUrl and postUrl with a demo-mode base path", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = original;
    }
  });

  it("keeps a base path baked into NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://demo.scatterpost.io/minimal";
    expect(siteUrl()).toBe("https://demo.scatterpost.io/minimal");
  });

  it("carries the base path through into postUrl", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://demo.scatterpost.io/minimal";
    expect(postUrl("hello-world")).toBe("https://demo.scatterpost.io/minimal/blog/hello-world");
  });

  it("strips a trailing slash from a base-path site URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://demo.scatterpost.io/minimal/";
    expect(siteUrl()).toBe("https://demo.scatterpost.io/minimal");
  });
});

describe("getStore and demo content seeding (NEXT_PUBLIC_DEMO_SEED_CONTENT)", () => {
  const original = process.env.NEXT_PUBLIC_DEMO_SEED_CONTENT;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_SEED_CONTENT;
    } else {
      process.env.NEXT_PUBLIC_DEMO_SEED_CONTENT = original;
    }
  });

  it("never lists a demo post when the flag is unset (a founder's own blog is unaffected)", async () => {
    delete process.env.NEXT_PUBLIC_DEMO_SEED_CONTENT;
    const posts = await getStore().list();
    expect(posts.some((post) => post.slug === "publishing-pipeline-live")).toBe(false);
  });

  it("lists the seeded demo posts alongside content/posts once the flag is exactly \"true\"", async () => {
    process.env.NEXT_PUBLIC_DEMO_SEED_CONTENT = "true";
    const posts = await getStore().list();
    expect(posts.some((post) => post.slug === "publishing-pipeline-live")).toBe(true);
  });

  it("does not seed demo content for any other value of the flag", async () => {
    process.env.NEXT_PUBLIC_DEMO_SEED_CONTENT = "1";
    const posts = await getStore().list();
    expect(posts.some((post) => post.slug === "publishing-pipeline-live")).toBe(false);
  });
});
