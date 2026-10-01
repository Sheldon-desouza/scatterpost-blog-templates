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
    // The XML sitemap, plus both RSS feeds, so a crawler that only reads
    // robots.txt still finds every machine-readable index this site
    // publishes: everything (`/feed.xml`) and the changelog on its own
    // (`/changelog/feed.xml`).
    sitemap: [`${site}/sitemap.xml`, `${site}/feed.xml`, `${site}/changelog/feed.xml`],
  };
}
