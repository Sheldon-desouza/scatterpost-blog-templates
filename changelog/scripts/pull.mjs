#!/usr/bin/env node
/**
 * Manual or non-Vercel-cron pull run: `npm run pull` (or `node
 * scripts/pull.mjs`). Reuses the same `pullDuePublications()`
 * implementation `app/api/scatterpost/pull/route.ts` runs on Vercel
 * Cron, imported directly since Node's built-in TypeScript support
 * strips the types at load time; nothing here is compiled separately.
 *
 * Needs SCATTERPOST_API_URL, SCATTERPOST_API_KEY, NEXT_PUBLIC_SITE_URL
 * and, unless CONTENT_STORE is left at its default, whichever of
 * BLOB_READ_WRITE_TOKEN or SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY the
 * chosen store needs (see .env.example).
 */
import { pullDuePublications } from "../src/lib/scatterpost/pull.ts";
import { getStore } from "../src/lib/site.ts";
import { withPullUrlBuilder } from "../src/lib/changelog.ts";

const apiUrl = process.env.SCATTERPOST_API_URL;
const apiKey = process.env.SCATTERPOST_API_KEY;

if (!apiUrl || !apiKey) {
  console.error("SCATTERPOST_API_URL and SCATTERPOST_API_KEY must both be set. See .env.example.");
  process.exit(1);
}

const { store, buildUrl } = withPullUrlBuilder(getStore());

const summary = await pullDuePublications({
  apiUrl,
  apiKey,
  store,
  buildUrl,
});

console.log(JSON.stringify(summary, null, 2));

if (summary.failed > 0) {
  process.exitCode = 1;
}
