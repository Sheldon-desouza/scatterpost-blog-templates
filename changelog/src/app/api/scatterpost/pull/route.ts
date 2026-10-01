/**
 * `GET /api/scatterpost/pull`: pull-mode poll, for a `website` channel
 * connected with `credentials.mode: "pull"`. `vercel.json` runs this on
 * a schedule; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`
 * automatically when the env var is named exactly `CRON_SECRET`, which
 * is what this checks.
 */
import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getStore, siteUrl } from "../../../../lib/site.ts";
import { pullDuePublications } from "../../../../lib/scatterpost/pull.ts";
import { withPullUrlBuilder } from "../../../../lib/changelog.ts";
import { pingIndexNow } from "../../../../lib/scatterpost/indexnow.ts";

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

  const { store, buildUrl } = withPullUrlBuilder(getStore());
  const summary = await pullDuePublications({
    apiUrl,
    apiKey,
    store,
    buildUrl,
    // Fire-and-forget per post; never awaited, never fails the run
    // (see indexnow.ts).
    onPublished: (url) => pingIndexNow({ siteUrl: siteUrl(), postUrl: url }),
  });

  if (summary.published > 0) {
    // A pull run can publish several posts at once; revalidate the
    // shared pages once rather than per post.
    revalidatePath("/changelog", "page");
    revalidatePath("/blog", "page");
    revalidatePath("/", "page");
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");
    revalidatePath("/changelog/feed.xml");
    revalidatePath("/llms.txt");
    revalidatePath("/llms-full.txt");
  }

  return Response.json(summary);
}
