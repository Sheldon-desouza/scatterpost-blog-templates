import { getStore, siteDescription, siteName, siteUrl } from "../../lib/site.ts";
import { renderRssFeed } from "../../lib/rss.ts";

export async function GET(): Promise<Response> {
  const posts = await getStore().list();

  const xml = renderRssFeed({
    title: siteName(),
    link: siteUrl(),
    description: siteDescription(),
    posts,
  });

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
