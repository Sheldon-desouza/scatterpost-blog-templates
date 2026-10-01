import { ImageResponse } from "next/og";
import { getStore, siteName } from "../../../lib/site.ts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * A plain text card on a dark background, to match this template's
 * dark-first theme: the post title, with the site name underneath. No
 * photography, no gradient, no emoji, so it reads cleanly at any size.
 */
export default async function OpengraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const post = await getStore().get(slug);
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
          background: "#0b0c0e",
          color: "#e6e8eb",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
        <div style={{ marginTop: 40, fontSize: 28, color: "#7fd0ff" }}>{siteName()}</div>
      </div>
    ),
    { ...size },
  );
}
