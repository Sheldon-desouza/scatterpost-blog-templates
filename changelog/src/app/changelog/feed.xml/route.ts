import { getStore, siteName, siteUrl } from "../../../lib/site.ts";
import { renderRssFeed } from "../../../lib/rss.ts";
import { splitPosts } from "../../../lib/changelog.ts";

export async function GET(): Promise<Response> {
  const { changelogPosts } = splitPosts(await getStore().list());

  const xml = renderRssFeed({
    title: `${siteName()} changelog`,
    link: `${siteUrl()}/changelog`,
    description: `Product updates from ${siteName()}, published with scatterpost.`,
    posts: changelogPosts,
  });

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
