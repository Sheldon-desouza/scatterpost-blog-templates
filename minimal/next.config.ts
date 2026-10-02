import type { NextConfig } from "next";

/**
 * Optional demo-mode base path: unset in a normal deploy, where the
 * template owns the whole domain. Set to e.g. "/minimal" only when this
 * template is served under a path on demo.scatterpost.io, so every
 * route, asset and `next/link` href is automatically prefixed. Must be
 * paired with a `NEXT_PUBLIC_SITE_URL` that already includes the same
 * path, since every absolute URL this template builds (canonical, RSS,
 * sitemap, llms.txt) is derived from that env var, not from basePath.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

// A mismatch here means every absolute URL this template builds (canonical,
// RSS, sitemap, llms.txt) points somewhere other than where the app is
// actually served. This is a warning, not a build failure, since a bare
// NEXT_PUBLIC_SITE_URL with no path is the normal, non-demo case.
if (basePath) {
  try {
    const sitePath = new URL(process.env.NEXT_PUBLIC_SITE_URL || "").pathname.replace(/\/$/, "");
    if (sitePath !== basePath) {
      console.warn(
        `[next.config] NEXT_PUBLIC_BASE_PATH ("${basePath}") does not match the path in ` +
          `NEXT_PUBLIC_SITE_URL ("${sitePath}"). Absolute URLs built from NEXT_PUBLIC_SITE_URL ` +
          `(canonical, RSS, sitemap, llms.txt) will not match where this app is actually served.`,
      );
    }
  } catch {
    console.warn(
      `[next.config] NEXT_PUBLIC_BASE_PATH ("${basePath}") is set but NEXT_PUBLIC_SITE_URL is ` +
        `missing or not a valid URL, so it cannot be checked against the base path.`,
    );
  }
}

/**
 * Opt-in: NEXT_PUBLIC_POSTS_AT_ROOT=true puts the post listing at the
 * root of the site (or of the base path) and each post at `/<slug>`
 * instead of `/blog/<slug>`, for a blog already served under a path of
 * its own (e.g. NEXT_PUBLIC_BASE_PATH=/blog at example.com/blog). The
 * old `/blog` URLs then permanently redirect (308) to the new ones, so
 * anything already published or cross-posted with them keeps working.
 * basePath is prefixed onto both sides automatically. Read at build
 * time, like every NEXT_PUBLIC_ variable.
 */
const postsAtRoot = process.env.NEXT_PUBLIC_POSTS_AT_ROOT === "true";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  async redirects() {
    if (!postsAtRoot) {
      return [];
    }
    return [
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:slug", destination: "/:slug", permanent: true },
    ];
  },
  async rewrites() {
    // The IndexNow key file lives at `/<key>.txt` (see
    // src/app/api/indexnow-key/[key]/route.ts). Served through a
    // rewrite rather than a dynamic top-level folder, so the top level
    // stays free for the `[slug]` post route. A plain (afterFiles)
    // rewrite runs after every literal route (/llms.txt, /robots.txt
    // and so on) has had its chance, and before any dynamic route.
    return [{ source: "/:key([A-Za-z0-9-]+\\.txt)", destination: "/api/indexnow-key/:key" }];
  },
};

export default nextConfig;
