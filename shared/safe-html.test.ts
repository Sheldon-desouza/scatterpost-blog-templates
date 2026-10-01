import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FileStore } from "./file-store.ts";
import { isValidSlug, serialiseJsonLd } from "./safe-html.ts";

describe("serialiseJsonLd (security review M10)", () => {
  it("cannot close the script tag or open an HTML comment", () => {
    const html = serialiseJsonLd({ headline: "</script><script>alert(1)</script><!--" });

    expect(html).not.toContain("<");
    expect(html).toContain("\\u003c/script>");
    expect(html).toContain("\\u003c!--");
  });

  it("parses back to the same value", () => {
    const value = { headline: "</script> & <!-- \u2028 ok", tags: ["a<b"] };

    expect(JSON.parse(serialiseJsonLd(value))).toEqual(value);
  });
});

describe("isValidSlug (security review L6)", () => {
  it("accepts the shapes slugify and collision suffixes produce", () => {
    expect(isValidSlug("hello-world")).toBe(true);
    expect(isValidSlug("hello-world-2")).toBe(true);
  });

  it("rejects traversal, separators and encoded separators", () => {
    for (const slug of ["..", "../README", "a/b", "..%2F..%2FREADME", "%2F", "a\\b", "", "Hello", "a.md"]) {
      expect(isValidSlug(slug)).toBe(false);
    }
  });
});

describe("FileStore.get never leaves the posts directory", () => {
  it("returns null for a traversal slug even when the target file exists", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "blog-starter-"));
    const postsDir = path.join(root, "content", "posts");
    await writeFile(path.join(root, "secret.md"), "---\ntitle: Secret\n---\nsecret", "utf8");

    const store = new FileStore(postsDir);

    expect(await store.get("../../secret")).toBeNull();
  });
});
