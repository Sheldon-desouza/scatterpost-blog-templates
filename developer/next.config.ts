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

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
