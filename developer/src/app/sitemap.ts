import type { MetadataRoute } from "next";
import { getStore, postUrl, siteUrl } from "../lib/site.ts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getStore().list();
  const site = siteUrl();
  const latest = posts[0]?.date ? new Date(posts[0].date) : new Date();

  return [
    { url: site, lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site}/blog`, lastModified: latest, changeFrequency: "daily", priority: 0.9 },
    ...posts.map((post) => ({
      url: postUrl(post.slug),
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
