import type { MetadataRoute } from "next";
import { getStore, postUrl, siteUrl } from "../lib/site.ts";
import { collectTags, postsForTagSlug } from "../lib/tags.ts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getStore().list();
  const site = siteUrl();
  const latest = posts[0]?.date ? new Date(posts[0].date) : new Date();
  const tags = collectTags(posts);

  return [
    { url: site, lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site}/blog`, lastModified: latest, changeFrequency: "daily", priority: 0.9 },
    { url: `${site}/tags`, lastModified: latest, changeFrequency: "weekly", priority: 0.5 },
    ...posts.map((post) => ({
      url: postUrl(post.slug),
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...tags.map((summary) => {
      const [mostRecent] = postsForTagSlug(posts, summary.slug);
      return {
        url: `${site}/tags/${summary.slug}`,
        lastModified: mostRecent ? new Date(mostRecent.date) : latest,
        changeFrequency: "weekly" as const,
        priority: 0.4,
      };
    }),
  ];
}
