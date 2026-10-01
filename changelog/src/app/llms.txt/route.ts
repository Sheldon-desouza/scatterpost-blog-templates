/**
 * Generated `/llms.txt`: a plain summary plus a list of posts for LLM
 * crawlers, per the emerging llms.txt convention. Changelog entries and
 * blog posts are listed under separate headings, reflecting the two
 * sections this template actually has. Regenerated on every request
 * from the current store, so it never drifts from what `/changelog` and
 * `/blog` actually list.
 */
import { getStore, siteDescription, siteName, siteUrl } from "../../lib/site.ts";
import { splitPosts, urlForPost } from "../../lib/changelog.ts";

export async function GET(): Promise<Response> {
  const { blogPosts, changelogPosts } = splitPosts(await getStore().list());
  const site = siteUrl();

  const lines = [
    `# ${siteName()}`,
    "",
    `> ${siteDescription()} ${site}.`,
    "",
    "## Changelog",
    "",
    ...changelogPosts.map((post) => `- [${post.title}](${post.canonical ?? urlForPost(post)}): ${post.description}`),
    "",
    "## Blog",
    "",
    ...blogPosts.map((post) => `- [${post.title}](${post.canonical ?? urlForPost(post)}): ${post.description}`),
    "",
  ];

  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
