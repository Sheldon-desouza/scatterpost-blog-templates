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
 * `/{key}.txt` reaches this route through a rewrite in `next.config.ts`
 * (to `/api/indexnow-key/{key}.txt`), so the top level of `src/app`
 * stays free for the `[slug]` post route used when posts live at the
 * root. The whole segment, including its `.txt` suffix, is the dynamic
 * `key` param. Literal routes (`/llms.txt`, `/robots.txt`, and so on)
 * are matched before the rewrite applies.
 */
import { notFound } from "next/navigation";
import { isValidIndexNowKey } from "../../../../lib/scatterpost/indexnow.ts";

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
