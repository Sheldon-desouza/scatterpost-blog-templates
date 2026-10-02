import { afterEach, describe, expect, it } from "vitest";
import { BASE_RESERVED_SLUGS, postPath, postsAtRoot, postsIndexPath, reservedSlugsFor, withBasePath } from "./post-paths.ts";

describe("post paths (NEXT_PUBLIC_POSTS_AT_ROOT)", () => {
  const original = process.env.NEXT_PUBLIC_POSTS_AT_ROOT;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    } else {
      process.env.NEXT_PUBLIC_POSTS_AT_ROOT = original;
    }
  });

  it("keeps posts under /blog when the option is unset", () => {
    delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    expect(postsAtRoot()).toBe(false);
    expect(postPath("hello-world")).toBe("/blog/hello-world");
    expect(postsIndexPath()).toBe("/blog");
  });

  it("only treats the exact string \"true\" as on", () => {
    process.env.NEXT_PUBLIC_POSTS_AT_ROOT = "1";
    expect(postsAtRoot()).toBe(false);
    expect(postPath("hello-world")).toBe("/blog/hello-world");
  });

  it("moves posts to /<slug> and the listing to / when the option is on", () => {
    process.env.NEXT_PUBLIC_POSTS_AT_ROOT = "true";
    expect(postsAtRoot()).toBe(true);
    expect(postPath("hello-world")).toBe("/hello-world");
    expect(postsIndexPath()).toBe("/");
  });

  it("reserves nothing when the option is off", () => {
    delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    expect(reservedSlugsFor(["tags"]).size).toBe(0);
  });

  it("reserves the base list plus the template's own routes when the option is on", () => {
    process.env.NEXT_PUBLIC_POSTS_AT_ROOT = "true";
    const reserved = reservedSlugsFor(["llms-full.txt", "custom"]);
    for (const slug of BASE_RESERVED_SLUGS) {
      expect(reserved.has(slug)).toBe(true);
    }
    expect(reserved.has("custom")).toBe(true);
    expect(reserved.has("hello-world")).toBe(false);
  });
});

describe("withBasePath (plain <a> and <img> under NEXT_PUBLIC_BASE_PATH)", () => {
  const original = process.env.NEXT_PUBLIC_BASE_PATH;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_BASE_PATH;
    } else {
      process.env.NEXT_PUBLIC_BASE_PATH = original;
    }
  });

  it("prefixes a root-relative path with the base path", () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/blog";
    expect(withBasePath("/feed.xml")).toBe("/blog/feed.xml");
  });

  it("leaves the path alone when no base path is set", () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    expect(withBasePath("/feed.xml")).toBe("/feed.xml");
  });

  it("passes absolute, protocol-relative and fragment URLs through", () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/blog";
    expect(withBasePath("https://github.com")).toBe("https://github.com");
    expect(withBasePath("//cdn.example.com/a.png")).toBe("//cdn.example.com/a.png");
    expect(withBasePath("#main-content")).toBe("#main-content");
  });
});
