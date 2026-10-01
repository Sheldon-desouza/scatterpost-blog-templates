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

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
