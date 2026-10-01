import { ImageResponse } from "next/og";
import { getStore, siteName } from "../../../lib/site.ts";
import { coverPlaceholder } from "../../../lib/cover-placeholder.ts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * The post's own generated placeholder gradient as the card background
 * (the same one the card grid falls back to when a post has no cover
 * image), with the title and site name set over it. Only used as the
 * Open Graph image fallback when a post has no `cover`; a post that
 * does have one is referenced directly in its `BlogPosting` JSON-LD and
 * Open Graph meta instead.
 */
export default async function OpengraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const post = await getStore().get(slug);
  const title = post?.title ?? siteName();
  const placeholder = coverPlaceholder(title);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "80px",
          background: placeholder.background,
          color: "#fdfcfb",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
        <div style={{ marginTop: 40, fontSize: 28, opacity: 0.85 }}>{siteName()}</div>
      </div>
    ),
    { ...size },
  );
}
