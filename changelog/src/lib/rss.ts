/**
 * Shared RSS 2.0 rendering for this template's two feeds: `/feed.xml`
 * (everything) and `/changelog/feed.xml` (changelog entries only). Kept
 * in one place so both feeds escape and structure items identically.
 */
import type { StoredPost } from "./scatterpost/content-store.ts";
import { renderMarkdown } from "./scatterpost/render-markdown.ts";
import { urlForPost } from "./changelog.ts";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface FeedChannel {
  title: string;
  link: string;
  description: string;
  posts: StoredPost[];
}

export function renderRssFeed(channel: FeedChannel): string {
  const items = channel.posts
    .map((post) => {
      const url = post.canonical ?? urlForPost(post);
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escapeXml(channel.title)}</title>
  <link>${escapeXml(channel.link)}</link>
  <description>${escapeXml(channel.description)}</description>
  ${items}
</channel>
</rss>`;
}
