/**
 * Env-driven site configuration. Kept in one place so a missing env var
 * fails with a clear message the first time it is needed, rather than as
 * `undefined` reaching a URL or a signature check.
 */
import path from "node:path";
import { BlobStore } from "./scatterpost/blob-store.ts";
import { FileStore } from "./scatterpost/file-store.ts";
import { SupabaseStore } from "./scatterpost/supabase-store.ts";
import { DemoContentStore } from "./scatterpost/demo-content-store.ts";
import { demoSeedContent } from "./demo.ts";
import type { ContentStore } from "./scatterpost/content-store.ts";
import { postPath } from "./scatterpost/post-paths.ts";

/**
 * Falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is
 * unset, rather than throwing, so `next build` (including the static
 * pages here, /blog, /robots.txt, /sitemap.xml) succeeds in CI and in a
 * fresh clone before the real value is set. Set it for real before
 * deploying, since it is what every canonical link, the RSS feed, and
 * the `{ url }` this site hands back to scatterpost are built from.
 */
export function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  return (url ?? "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * A post's absolute URL: `<site>/blog/<slug>` by default, or
 * `<site>/<slug>` with NEXT_PUBLIC_POSTS_AT_ROOT=true (see
 * scatterpost/post-paths.ts, the one place that decides the path).
 */
export function postUrl(slug: string): string {
  return `${siteUrl()}${postPath(slug)}`;
}

/** Site and author name, with sane defaults so the empty state and the
 * JSON-LD on every page still read well before these are set. */
export function siteName(): string {
  return process.env.SITE_NAME || "My blog";
}

export function authorName(): string {
  return process.env.AUTHOR_NAME || siteName();
}

/**
 * https-only, like `sameAsUrls` below (security re-review LOW-3): an
 * `http://` or malformed `AUTHOR_URL` is dropped rather than reaching
 * the JSON-LD or the post byline's link.
 */
function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function authorUrl(): string | undefined {
  const raw = process.env.AUTHOR_URL;
  if (!raw) return undefined;
  return isHttpsUrl(raw) ? raw : undefined;
}

/**
 * Comma-separated list of the author or organisation's other profiles
 * (e.g. GitHub, LinkedIn, X), validated to https URLs only, fed into
 * the home page's `Person`/`Organization` JSON-LD as `sameAs` so search
 * engines and AI assistants can connect this site to those profiles. An
 * entry that fails to parse as a URL, or is not https, is dropped
 * rather than failing the whole list.
 */
export function sameAsUrls(): string[] {
  const raw = process.env.SAME_AS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((url) => url.trim())
    .filter((url) => isHttpsUrl(url));
}

/**
 * Search engine verification, read into `metadata.verification` by
 * every template's `layout.tsx`. `undefined` when unset, so Next omits
 * the meta tag entirely rather than rendering one with an empty value.
 */
export function googleSiteVerification(): string | undefined {
  return process.env.GOOGLE_SITE_VERIFICATION || undefined;
}

export function bingSiteVerification(): string | undefined {
  return process.env.BING_SITE_VERIFICATION || undefined;
}

/**
 * `CONTENT_STORE` chooses the persistence backend: `"blob"` (Vercel
 * Blob, writes `posts/*.md`), `"file"` (writes `content/posts/*.md`,
 * local dev only, since Vercel's production filesystem is read-only) or
 * `"supabase"` (writes the `posts` table, an optional alternative). When
 * unset, defaults to `"blob"` if `BLOB_READ_WRITE_TOKEN` is present
 * (meaning a Blob store is connected), otherwise `"file"`. See
 * `supabase/posts.sql` for the table `"supabase"` expects.
 */
function buildStore(): ContentStore {
  const kind = process.env.CONTENT_STORE || (process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "file");
  if (kind === "blob") {
    return new BlobStore();
  }
  if (kind === "supabase") {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("CONTENT_STORE=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. See .env.example.");
    }
    return new SupabaseStore(url, serviceRoleKey);
  }
  if (kind !== "file") {
    throw new Error(`Unknown CONTENT_STORE "${kind}", expected "blob", "file" or "supabase".`);
  }
  return new FileStore();
}

/**
 * The real store, plus, only while `NEXT_PUBLIC_DEMO_SEED_CONTENT` is
 * `"true"`, the committed demo posts under `demo-content/posts`,
 * read-only and listed alongside whatever the real store holds. Unset
 * (the default, and what a founder's own deploy leaves it as), this is
 * exactly `buildStore()`.
 */
export function getStore(): ContentStore {
  const store = buildStore();
  if (!demoSeedContent()) {
    return store;
  }
  const demoStore = new FileStore(path.join(process.cwd(), "demo-content", "posts"));
  return new DemoContentStore(store, demoStore);
}

export function webhookSecret(): string {
  const secret = process.env.SCATTERPOST_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("SCATTERPOST_WEBHOOK_SECRET is not set. See .env.example.");
  }
  // A short secret is brute-forceable against the HMAC in
  // verify-signature.ts (security review L3); 32 characters matches
  // what .env.example documents and what scatterpost itself generates.
  if (secret.length < 32) {
    throw new Error("SCATTERPOST_WEBHOOK_SECRET must be at least 32 characters. See .env.example.");
  }
  return secret;
}
