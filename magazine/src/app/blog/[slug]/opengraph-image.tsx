import { ImageResponse } from "next/og";
import { getStore, siteName } from "../../../lib/site.ts";
import { isValidSlug } from "../../../lib/scatterpost/safe-html.ts";
import { kickerFor } from "../../../lib/kicker.ts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * A cover-style card: the deep red kicker, a big Newsreader headline,
 * and the site name underneath, on the dark ink background that gives
 * every post its cover treatment even when it has no `cover` image of
 * its own. Only used as the Open Graph image fallback; a post that does
 * have a cover is referenced directly in its `BlogPosting` JSON-LD and
 * Open Graph meta instead.
 */
export default async function OpengraphImage({ params }: ImageProps) {
  const { slug } = await params;
  // Matches the page's own `isValidSlug` guard (security review L6): an
  // invalid slug never even reaches the store.
  const post = isValidSlug(slug) ? await getStore().get(slug) : null;
  const title = post?.title ?? siteName();
  const kicker = post ? kickerFor(post) : "Dispatch";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#141414",
          color: "#f0f0ee",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 600, color: "#ff8a7a", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {kicker}
        </div>
        <div style={{ fontSize: 60, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 26, color: "#a8a8a4" }}>{siteName()}</div>
      </div>
    ),
    { ...size },
  );
}
