import { ImageResponse } from "next/og";
import { getStore, siteName } from "../../../lib/site.ts";
import { isValidSlug } from "../../../lib/scatterpost/safe-html.ts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * A plain text card on a solid background: the post title, with the
 * site name underneath. No photography, no gradient, no emoji, so it
 * reads cleanly at any size.
 */
export default async function OpengraphImage({ params }: ImageProps) {
  const { slug } = await params;
  // Matches the page's own `isValidSlug` guard (security review L6): an
  // invalid slug never even reaches the store.
  const post = isValidSlug(slug) ? await getStore().get(slug) : null;
  const title = post?.title ?? siteName();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#ffffff",
          color: "#111113",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 600, color: "#5b4bdb", letterSpacing: "-0.01em" }}>{siteName()}</div>
        <div style={{ marginTop: 16, fontSize: 56, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
          {title}
        </div>
      </div>
    ),
    { ...size },
  );
}
