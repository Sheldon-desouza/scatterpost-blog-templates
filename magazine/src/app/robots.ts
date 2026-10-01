import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/site.ts";

export default function robots(): MetadataRoute.Robots {
  const site = siteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Explicitly welcome the crawlers behind AI search and assistants,
      // in case a founder's own robots policy elsewhere defaults these
      // to disallow.
      { userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"], allow: "/" },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
