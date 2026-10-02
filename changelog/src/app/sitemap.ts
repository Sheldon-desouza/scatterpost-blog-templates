import type { MetadataRoute } from "next";
import { postsAtRoot } from "../lib/scatterpost/post-paths.ts";
import { getStore, siteUrl } from "../lib/site.ts";
import { splitPosts, urlForPost } from "../lib/changelog.ts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { blogPosts, changelogPosts } = splitPosts(await getStore().list());
  const site = siteUrl();
  const latestChangelog = changelogPosts[0]?.date ? new Date(changelogPosts[0].date) : new Date();
  const latestBlog = blogPosts[0]?.date ? new Date(blogPosts[0].date) : new Date();
  const latest = latestChangelog > latestBlog ? latestChangelog : latestBlog;

  return [
    { url: site, lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site}/changelog`, lastModified: latestChangelog, changeFrequency: "weekly", priority: 0.9 },
    // With posts at the root, /blog only redirects to the home page.
    ...(postsAtRoot() ? [] : [{ url: `${site}/blog`, lastModified: latestBlog, changeFrequency: "daily" as const, priority: 0.9 }]),
    ...[...blogPosts, ...changelogPosts].map((post) => ({
      url: urlForPost(post),
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
