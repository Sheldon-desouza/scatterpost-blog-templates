import { getStore, postUrl, siteName, siteUrl } from "../../lib/site.ts";
import { renderMarkdown } from "../../lib/scatterpost/render-markdown.ts";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const posts = await getStore().list();
  const site = siteUrl();

  const items = posts
    .map((post) => {
      const url = post.canonical ?? postUrl(post.slug);
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${escapeXml(url)}</link>
  <guid isPermaLink="true">${escapeXml(url)}</guid>
  <pubDate>${new Date(post.date).toUTCString()}</pubDate>
  <description>${escapeXml(post.description)}</description>
  <content:encoded><![CDATA[${renderMarkdown(post.bodyMarkdown)}]]></content:encoded>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escapeXml(siteName())}</title>
  <link>${escapeXml(site)}</link>
  <description>${escapeXml(`${siteName()}, published with scatterpost.`)}</description>
  ${items}
</channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
