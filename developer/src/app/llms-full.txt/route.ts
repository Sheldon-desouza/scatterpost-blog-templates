/**
 * Generated `/llms-full.txt`: every post's full body as plain Markdown,
 * for an LLM crawler that wants the whole site in one request instead of
 * following each link from `/llms.txt`.
 */
import { getStore, postUrl, siteName, siteUrl } from "../../lib/site.ts";

export async function GET(): Promise<Response> {
  const posts = await getStore().list();
  const site = siteUrl();

  const sections = posts.map((post) => {
    const url = post.canonical ?? postUrl(post.slug);
    return [`# ${post.title}`, "", `URL: ${url}`, `Date: ${post.date}`, "", post.bodyMarkdown, ""].join("\n");
  });

  const header = [
    `# ${siteName()}`,
    "",
    `> ${siteName()}, published with scatterpost, at ${site}. Full text of every post follows.`,
    "",
  ].join("\n");

  const body = `${header}\n---\n\n${sections.join("\n---\n\n")}`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
