import { ImageResponse } from "next/og";
import { getStore, siteName } from "../../../lib/site.ts";
import { parseVersion } from "../../../lib/changelog.ts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * A plain text card on a solid background: the version label (if the
 * title has one), the entry's title, and the site name underneath. No
 * photography, no gradient, no emoji, so it reads cleanly at any size.
 */
export default async function OpengraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const post = await getStore().get(slug);
  const title = post?.title ?? siteName();
  const version = post ? parseVersion(post.title) : undefined;

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
          color: "#101828",
        }}
      >
        {version ? (
          <div style={{ fontSize: 28, fontWeight: 600, color: "#2554ea", marginBottom: 16 }}>{version}</div>
        ) : null}
        <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
        <div style={{ marginTop: 40, fontSize: 28, color: "#55617a" }}>{siteName()}</div>
      </div>
    ),
    { ...size },
  );
}
