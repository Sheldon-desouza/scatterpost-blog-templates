/**
 * Generated `/llms.txt`: a plain summary plus a list of posts for LLM
 * crawlers, per the emerging llms.txt convention. Regenerated on every
 * request from the current store, so it never drifts from what `/blog`
 * actually lists.
 */
import { getStore, postUrl, siteName, siteUrl } from "../../lib/site.ts";

export async function GET(): Promise<Response> {
  const posts = await getStore().list();
  const site = siteUrl();

  const lines = [
    `# ${siteName()}`,
    "",
    `> ${siteName()}, published with scatterpost, at ${site}.`,
    "",
    "## Posts",
    "",
    ...posts.map((post) => `- [${post.title}](${post.canonical ?? postUrl(post.slug)}): ${post.description}`),
    "",
  ];

  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
