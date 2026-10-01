/**
 * Env-driven site configuration. Kept in one place so a missing env var
 * fails with a clear message the first time it is needed, rather than as
 * `undefined` reaching a URL or a signature check.
 */
import { BlobStore } from "./scatterpost/blob-store.ts";
import { FileStore } from "./scatterpost/file-store.ts";
import { SupabaseStore } from "./scatterpost/supabase-store.ts";
import type { ContentStore } from "./scatterpost/content-store.ts";

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

export function postUrl(slug: string): string {
  return `${siteUrl()}/blog/${slug}`;
}

export function changelogUrl(slug: string): string {
  return `${siteUrl()}/changelog/${slug}`;
}

/** Site name and one-line description, with sane defaults so the empty
 * state, the home page and the JSON-LD on every page still read well
 * before these are set. */
export function siteName(): string {
  return process.env.SITE_NAME || "My product";
}

export function siteDescription(): string {
  return process.env.SITE_DESCRIPTION || "Product updates and articles, published with scatterpost.";
}

export function authorName(): string {
  return process.env.AUTHOR_NAME || siteName();
}

export function authorUrl(): string | undefined {
  return process.env.AUTHOR_URL || undefined;
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
export function getStore(): ContentStore {
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
