import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { reservedSlugs, TOP_LEVEL_ROUTES } from "./top-level-routes.ts";

// Files at the top of src/app that are not routes of their own.
const NOT_ROUTES = new Set(["layout.tsx", "page.tsx", "not-found.tsx", "globals.css"]);
// Metadata files that answer at a different name than their file.
const METADATA_ROUTES: Record<string, string> = { "robots.ts": "robots.txt", "sitemap.ts": "sitemap.xml" };

function routesInAppDirectory(): string[] {
  const appDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "app");
  const names: string[] = [];
  for (const entry of readdirSync(appDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Dynamic ([slug]), group ((name)) and private (_name) folders do
      // not claim a literal top-level name.
      if (!/^[[(_]/.test(entry.name)) names.push(entry.name);
      continue;
    }
    if (NOT_ROUTES.has(entry.name) || entry.name.includes(".test.")) continue;
    const mapped = METADATA_ROUTES[entry.name];
    names.push(mapped ?? entry.name.replace(/\.(tsx?|jsx?)$/, ""));
  }
  return names;
}

describe("top-level routes and reserved slugs", () => {
  const original = process.env.NEXT_PUBLIC_POSTS_AT_ROOT;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    } else {
      process.env.NEXT_PUBLIC_POSTS_AT_ROOT = original;
    }
  });

  it("lists every top-level route in src/app", () => {
    expect([...TOP_LEVEL_ROUTES].sort()).toEqual(routesInAppDirectory().sort());
  });

  it("reserves every top-level route plus the base list when posts live at the root", () => {
    process.env.NEXT_PUBLIC_POSTS_AT_ROOT = "true";
    const reserved = reservedSlugs();
    for (const name of [...TOP_LEVEL_ROUTES, "blog", "feed.xml", "sitemap.xml", "robots.txt", "llms.txt", "api", "tags", "changelog", "opengraph-image"]) {
      expect(reserved.has(name)).toBe(true);
    }
  });

  it("reserves nothing when the option is off", () => {
    delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    expect(reservedSlugs().size).toBe(0);
  });
});
