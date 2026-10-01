/**
 * `POST /api/scatterpost`: push-mode publish. scatterpost calls this
 * with a signed payload; this verifies the signature, validates the
 * payload, writes it through the `ContentStore`, revalidates every page
 * that could show it, and returns `{ url }`, which scatterpost then
 * records as the canonical.
 */
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { getStore, postUrl, siteUrl, webhookSecret } from "../../../lib/site.ts";
import { verifySignature } from "../../../lib/scatterpost/verify-signature.ts";
import { ScatterpostPayloadSchema } from "../../../lib/scatterpost/scatterpost-payload.ts";
import { slugifyWithFallback } from "../../../lib/scatterpost/slugify.ts";
import { pingIndexNow } from "../../../lib/scatterpost/indexnow.ts";

function revalidateEverywhereAPostCanAppear(slug: string): void {
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");
  revalidatePath("/");
  // A post's tags can be new or changed, so revalidate the whole /tags
  // subtree (the index and every /tags/[tag] page) rather than one slug.
  revalidatePath("/tags", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/llms-full.txt");
}

export async function POST(request: Request): Promise<Response> {
  const signatureHeader = request.headers.get("x-scatterpost-signature");
  if (!signatureHeader) {
    return Response.json({ error: "Missing X-Scatterpost-Signature header." }, { status: 401 });
  }

  const rawBody = await request.text();

  let secret: string;
  try {
    secret = webhookSecret();
  } catch (cause) {
    // The real cause (e.g. "SCATTERPOST_WEBHOOK_SECRET is not set") is
    // server configuration detail, not something a caller needs or
    // should see; logged here, a generic message is returned instead
    // (security review L4).
    console.error("POST /api/scatterpost: server misconfigured.", cause);
    return Response.json({ error: "Server misconfigured." }, { status: 500 });
  }

  if (!verifySignature(secret, signatureHeader, rawBody)) {
    return Response.json({ error: "Invalid or expired signature." }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Body is not valid JSON." }, { status: 400 });
  }

  const result = ScatterpostPayloadSchema.safeParse(parsedBody);
  if (!result.success) {
    return Response.json({ error: "Payload failed validation.", details: result.error.flatten() }, { status: 400 });
  }
  const payload = result.data;

  const store = getStore();
  const { slug } = await store.save({
    slug: slugifyWithFallback(payload.title, payload.idempotencyKey),
    scatterpostId: payload.idempotencyKey,
    title: payload.title,
    date: payload.publishedAt,
    description: "",
    tags: payload.tags,
    canonical: payload.canonicalUrl,
    cover: payload.coverImageUrl,
    bodyMarkdown: payload.bodyMarkdown,
  });

  revalidateEverywhereAPostCanAppear(slug);

  const url = postUrl(slug);
  // Fire-and-forget: scheduled with `after` so it runs once this
  // response has been sent, and never delays or fails the publish
  // itself (see indexnow.ts).
  after(() => pingIndexNow({ siteUrl: siteUrl(), postUrl: url }));

  return Response.json({ url });
}
