import { ImageResponse } from "next/og";
import { getStore, siteName } from "../../../lib/site.ts";
import { isValidSlug } from "../../../lib/scatterpost/safe-html.ts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * A plain text card on a dark surface: a mono kicker (date, then the
 * site name), the post title in the UI face. No photography, no
 * gradient, no emoji, so it reads cleanly at any size. Always this
 * dark palette (the platforms that embed this image don't honour a
 * reader's light/dark choice).
 */
export default async function OpengraphImage({ params }: ImageProps) {
  const { slug } = await params;
  // Matches the page's own `isValidSlug` guard (security review L6): an
  // invalid slug never even reaches the store.
  const post = isValidSlug(slug) ? await getStore().get(slug) : null;
  const title = post?.title ?? siteName();
  const date = post?.date
    ? new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    : undefined;
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

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
          background: "#12161b",
          color: "#e6eaf0",
        }}
      >
        <div style={{ fontFamily: mono, fontSize: 24, color: "#4fd1a5", letterSpacing: "0.02em" }}>
          {date ?? siteName()}
        </div>
        <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontFamily: mono, fontSize: 24, color: "#9aa4b2" }}>{siteName()}</div>
      </div>
    ),
    { ...size },
  );
}
