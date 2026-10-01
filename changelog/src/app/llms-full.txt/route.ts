/**
 * Generated `/llms-full.txt`: every post's full body as plain Markdown,
 * for an LLM crawler that wants the whole site in one request instead of
 * following each link from `/llms.txt`. Changelog entries and blog
 * posts run as two separate sections, in that order.
 */
import { getStore, siteDescription, siteName, siteUrl } from "../../lib/site.ts";
import { splitPosts, urlForPost } from "../../lib/changelog.ts";
import type { StoredPost } from "../../lib/scatterpost/content-store.ts";

function renderSection(heading: string, posts: StoredPost[]): string {
  const body = posts
    .map((post) => {
      const url = post.canonical ?? urlForPost(post);
      return [`# ${post.title}`, "", `URL: ${url}`, `Date: ${post.date}`, "", post.bodyMarkdown, ""].join("\n");
    })
    .join("\n---\n\n");
  return [`## ${heading}`, "", body || "(none yet)"].join("\n");
}

export async function GET(): Promise<Response> {
  const { blogPosts, changelogPosts } = splitPosts(await getStore().list());
  const site = siteUrl();

  const header = [
    `# ${siteName()}`,
    "",
    `> ${siteDescription()} ${site}. Full text of every post follows, changelog first.`,
    "",
  ].join("\n");

  const body = [header, renderSection("Changelog", changelogPosts), renderSection("Blog", blogPosts)].join(
    "\n---\n\n",
  );

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
