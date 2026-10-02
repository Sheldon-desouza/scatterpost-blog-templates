/**
 * `GET /{key}.txt`: the key file IndexNow expects at
 * `https://<host>/<key>.txt` to prove ownership of the key sent with
 * every ping (see `src/lib/scatterpost/indexnow.ts`). Optional: when
 * `INDEXNOW_KEY` is unset or malformed, or the requested segment does
 * not match it exactly, this calls `notFound()` (security re-review
 * LOW-1) so a visitor who lands on, say, `/favicon.txt` gets the
 * site's normal not-found page rather than a bare 404 body, and so
 * the response neither confirms nor denies which key (if any) is
 * configured.
 *
 * The whole single path segment, including its `.txt` suffix, is the
 * dynamic `key` param here (there is no separate `[key]/route.ts` and
 * `.txt`-suffix split in the Next.js App Router); every other
 * top-level route (`/blog`, `/llms.txt`, `/sitemap.xml`, and so on) is
 * a literal folder, which Next always matches before falling back to
 * this dynamic one.
 */
import { notFound } from "next/navigation";
import { isValidIndexNowKey } from "../../lib/scatterpost/indexnow.ts";

interface RouteProps {
  params: Promise<{ key: string }>;
}

export async function GET(_request: Request, { params }: RouteProps): Promise<Response> {
  const { key: requestedSegment } = await params;
  const indexNowKey = process.env.INDEXNOW_KEY;

  if (!isValidIndexNowKey(indexNowKey) || requestedSegment !== `${indexNowKey}.txt`) {
    notFound();
  }

  return new Response(indexNowKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
