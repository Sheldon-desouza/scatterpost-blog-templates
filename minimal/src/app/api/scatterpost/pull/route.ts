/**
 * `GET /api/scatterpost/pull`: pull-mode poll, for a `website` channel
 * connected with `credentials.mode: "pull"`. `vercel.json` runs this on
 * a schedule; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`
 * automatically when the env var is named exactly `CRON_SECRET`, which
 * is what this checks.
 */
import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { getStore, postUrl, siteUrl } from "../../../../lib/site.ts";
import { pullDuePublications } from "../../../../lib/scatterpost/pull.ts";
import { pingIndexNow } from "../../../../lib/scatterpost/indexnow.ts";
import { reservedSlugs } from "../../../../lib/top-level-routes.ts";
import { postsIndexPath } from "../../../../lib/scatterpost/post-paths.ts";

function hasValidCronSecret(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;

  const headerBuf = Buffer.from(header);
  const expectedBuf = Buffer.from(expected);
  const size = Math.max(headerBuf.length, expectedBuf.length, 1);
  const paddedHeader = Buffer.alloc(size);
  const paddedExpected = Buffer.alloc(size);
  headerBuf.copy(paddedHeader);
  expectedBuf.copy(paddedExpected);

  return headerBuf.length === expectedBuf.length && timingSafeEqual(paddedHeader, paddedExpected);
}

export async function GET(request: Request): Promise<Response> {
  if (!process.env.CRON_SECRET || !hasValidCronSecret(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.SCATTERPOST_API_URL;
  const apiKey = process.env.SCATTERPOST_API_KEY;
  if (!apiUrl || !apiKey) {
    return Response.json({ error: "SCATTERPOST_API_URL and SCATTERPOST_API_KEY must be set." }, { status: 500 });
  }

  const summary = await pullDuePublications({
    apiUrl,
    apiKey,
    store: getStore(),
    buildUrl: postUrl,
    reservedSlugs: reservedSlugs(),
    // Scheduled with `after` so it runs once this response has been
    // sent (security re-review LOW-2); fire-and-forget and never
    // throws synchronously either way (see indexnow.ts), so it can
    // never mark a published post as failed.
    onPublished: (url) => after(() => pingIndexNow({ siteUrl: siteUrl(), postUrl: url })),
  });

  if (summary.published > 0) {
    // A pull run can publish several posts at once; revalidate the
    // shared pages once rather than per post.
    revalidatePath(postsIndexPath(), "page");
    revalidatePath("/", "page");
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");
    revalidatePath("/llms.txt");
    revalidatePath("/llms-full.txt");
  }

  return Response.json(summary);
}
