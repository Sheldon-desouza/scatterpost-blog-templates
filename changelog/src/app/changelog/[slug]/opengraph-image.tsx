import { ImageResponse } from "next/og";
import { getStore, siteName } from "../../../lib/site.ts";
import { parseVersion } from "../../../lib/changelog.ts";
import { isValidSlug } from "../../../lib/scatterpost/safe-html.ts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * A plain card on a solid background: the version badge (if the title
 * has one), the date, the entry's title and the site name. No
 * photography, no gradient, no emoji, so it reads cleanly at any size.
 * Always the light palette (the platforms that embed this image don't
 * honour a reader's dark mode).
 */
export default async function OpengraphImage({ params }: ImageProps) {
  const { slug } = await params;
  // Matches the page's own `isValidSlug` guard (security review L6): an
  // invalid slug never even reaches the store.
  const post = isValidSlug(slug) ? await getStore().get(slug) : null;
  const title = post?.title ?? siteName();
  const version = post ? parseVersion(post.title) : undefined;
  const date = post?.date
    ? new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    : undefined;

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
          background: "#ffffff",
          color: "#111113",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {version ? (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 600,
                color: "#5b4bdb",
                border: "2px solid #e7e7ea",
                borderRadius: 999,
                padding: "8px 20px",
              }}
            >
              {version}
            </div>
          ) : null}
          {date ? <div style={{ fontSize: 24, color: "#5b5b66" }}>{date}</div> : null}
        </div>
        <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em" }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 500, color: "#5b5b66" }}>{siteName()}</div>
      </div>
    ),
    { ...size },
  );
}
