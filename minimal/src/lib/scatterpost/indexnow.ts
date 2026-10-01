/**
 * IndexNow: an optional fire-and-forget ping to
 * https://api.indexnow.org/indexnow after a successful publish, so Bing
 * (and the AI assistants it feeds) can pick up a new post sooner than
 * its next crawl. `INDEXNOW_KEY` is the only configuration: when unset
 * or malformed, `pingIndexNow` does nothing, and the `/{key}.txt` route
 * (`src/app/[key]/route.ts`) 404s.
 *
 * Never awaited by a caller and never throws: a publish has already
 * succeeded by the time this runs, so a failed or slow ping must not
 * delay or fail the response that tells scatterpost the post is live.
 */

// 8 to 128 characters of a-z, A-Z, 0-9 and "-", per IndexNow's own key
// format (https://www.indexnow.org/documentation).
const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

export function isValidIndexNowKey(value: string | undefined | null): value is string {
  return typeof value === "string" && INDEXNOW_KEY_PATTERN.test(value);
}

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export function buildIndexNowPayload(siteUrl: string, key: string, postUrl: string): IndexNowPayload {
  return {
    host: new URL(siteUrl).host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList: [postUrl, `${siteUrl}/sitemap.xml`],
  };
}

export interface PingIndexNowOptions {
  siteUrl: string;
  postUrl: string;
  fetchImpl?: typeof fetch;
}

export function pingIndexNow({ siteUrl, postUrl, fetchImpl = fetch }: PingIndexNowOptions): void {
  const key = process.env.INDEXNOW_KEY;
  if (!isValidIndexNowKey(key)) return;

  const payload = buildIndexNowPayload(siteUrl, key, postUrl);
  fetchImpl("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  }).catch((cause) => {
    // Logged, not thrown: the publish this follows has already
    // succeeded, and IndexNow is a courtesy ping, not part of the
    // publish contract.
    console.error("IndexNow ping failed; the publish itself already succeeded.", cause);
  });
}
