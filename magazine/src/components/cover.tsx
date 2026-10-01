/**
 * A post's cover image, or a generated placeholder when it has none.
 *
 * Cover URLs come from `coverImageUrl` on the scatterpost payload: an
 * arbitrary HTTPS URL on whatever host a founder's own pipeline stores
 * images on, not a fixed set of hosts this template can list in
 * `next.config.ts`'s `images.remotePatterns`. A wildcard remote pattern
 * would turn this site's own `next/image` optimiser into an open proxy
 * that fetches any URL a payload names, which is the SSRF shape that
 * feature is meant to avoid. So covers render as a plain `<img>`
 * instead (no optimiser fetch on this site's own server), with an
 * explicit width and height to avoid layout shift and `loading="lazy"`
 * so an offscreen card never blocks the page. Only an `https://` URL is
 * ever rendered; anything else falls back to the placeholder.
 */
import { coverPlaceholder } from "../lib/cover-placeholder.ts";

interface CoverProps {
  title: string;
  cover?: string;
  /** Marks the image above the fold (the featured post) as eager and
   * high priority; every other card stays lazy. */
  priority?: boolean;
}

function isSafeHttpsUrl(url: string): boolean {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export function Cover({ title, cover, priority = false }: CoverProps) {
  if (cover && isSafeHttpsUrl(cover)) {
    return (
      <div className="cover-frame">
        {/* eslint-disable-next-line @next/next/no-img-element -- deliberate: see the file comment above. */}
        <img
          src={cover}
          alt=""
          width={1200}
          height={675}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    );
  }

  const placeholder = coverPlaceholder(title);
  return (
    <div className="cover-frame">
      <div className="cover-placeholder" style={{ background: placeholder.background }}>
        <span>{placeholder.label}</span>
      </div>
    </div>
  );
}
