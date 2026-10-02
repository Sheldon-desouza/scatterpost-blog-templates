import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StoredPost } from "../../../lib/scatterpost/content-store.ts";

// The `{ url }` this route returns becomes the canonical of every
// cross-post, so it must follow NEXT_PUBLIC_POSTS_AT_ROOT exactly.
const saved: StoredPost[] = [];
vi.mock("../../../lib/site.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/site.ts")>()),
  getStore: () => ({
    list: async () => saved,
    get: async (slug: string) => saved.find((post) => post.slug === slug) ?? null,
    save: async (post: StoredPost) => {
      saved.push(post);
      return { slug: post.slug, created: true };
    },
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn() }));

const { POST } = await import("./route.ts");
const { revalidatePath } = await import("next/cache");

const SECRET = "a-test-webhook-secret-of-at-least-32-chars";

function signedRequest(title: string): Request {
  const body = JSON.stringify({
    id: "pub_1",
    idempotencyKey: "idem_1",
    title,
    bodyMarkdown: "# Hello\n\nBody.",
    tags: [],
    publishedAt: "2026-10-01T09:00:00.000Z",
  });
  const t = Math.floor(Date.now() / 1000);
  const v1 = createHmac("sha256", SECRET).update(`${t}.${body}`).digest("hex");
  return new Request("https://example.com/api/scatterpost", {
    method: "POST",
    headers: { "x-scatterpost-signature": `t=${t},v1=${v1}` },
    body,
  });
}

describe("POST /api/scatterpost and NEXT_PUBLIC_POSTS_AT_ROOT", () => {
  const env = {
    NEXT_PUBLIC_POSTS_AT_ROOT: process.env.NEXT_PUBLIC_POSTS_AT_ROOT,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SCATTERPOST_WEBHOOK_SECRET: process.env.SCATTERPOST_WEBHOOK_SECRET,
  };

  beforeEach(() => {
    saved.length = 0;
    vi.mocked(revalidatePath).mockClear();
    process.env.SCATTERPOST_WEBHOOK_SECRET = SECRET;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/blog";
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("returns <site>/blog/<slug> when the option is off", async () => {
    delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    const response = await POST(signedRequest("Hello world"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://example.com/blog/blog/hello-world" });
    expect(revalidatePath).toHaveBeenCalledWith("/blog/hello-world");
  });

  it("returns <site>/<slug> when the option is on, and revalidates the root paths", async () => {
    process.env.NEXT_PUBLIC_POSTS_AT_ROOT = "true";
    const response = await POST(signedRequest("Hello world"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://example.com/blog/hello-world" });
    expect(revalidatePath).toHaveBeenCalledWith("/hello-world");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("refuses a title that slugifies to a reserved slug with a 422, saving nothing", async () => {
    process.env.NEXT_PUBLIC_POSTS_AT_ROOT = "true";
    for (const title of ["Blog", "API", "Tags", "Changelog"]) {
      const response = await POST(signedRequest(title));
      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.error).toBe("Payload failed validation.");
      expect(body.details.fieldErrors.title[0]).toMatch(/is reserved/);
    }
    expect(saved).toHaveLength(0);
  });

  it("publishes the same titles as before when the option is off", async () => {
    delete process.env.NEXT_PUBLIC_POSTS_AT_ROOT;
    const response = await POST(signedRequest("Tags"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://example.com/blog/blog/tags" });
  });
});
