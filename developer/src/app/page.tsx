import Link from "next/link";
import { getStore } from "../lib/site.ts";
import { authorName, authorUrl, siteName, siteUrl } from "../lib/site.ts";
import { serialiseJsonLd } from "../lib/scatterpost/safe-html.ts";
import { readingTimeMinutes } from "../lib/reading-time.ts";

export default async function HomePage() {
  const posts = (await getStore().list()).slice(0, 5);
  const site = siteUrl();

  const author = authorUrl()
    ? { "@type": "Person", name: authorName(), url: authorUrl() }
    : { "@type": "Organization", name: authorName() };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: siteName(), url: site },
      author,
    ],
  };

  return (
    <div className="measure flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">{siteName()}</h1>
      <p className="text-[var(--muted-foreground)]">
        A blog by {authorName()}, published with{" "}
        <a href="https://scatterpost.io" className="underline">
          scatterpost
        </a>
        : it publishes to this site first, then cross-posts elsewhere with a
        canonical link back here.
      </p>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-medium">No posts yet</h2>
          <p className="mt-2">
            This blog is ready to receive its first post. Connect it as a
            Website channel in scatterpost with your deployed URL and a
            webhook secret (<code>SCATTERPOST_WEBHOOK_SECRET</code>), or set
            up pull mode with <code>SCATTERPOST_API_URL</code> and{" "}
            <code>SCATTERPOST_API_KEY</code>. See this template&apos;s README
            for the exact steps.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-6">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-[var(--border)] pb-6">
              <Link href={`/blog/${post.slug}`} className="text-lg font-medium underline">
                {post.title}
              </Link>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
                </time>
                {" · "}
                {readingTimeMinutes(post.bodyMarkdown)} min read
              </p>
              {post.description ? <p className="mt-2">{post.description}</p> : null}
            </li>
          ))}
        </ul>
      )}

      <p>
        <Link href="/blog" className="tap-target underline">
          See all posts
        </Link>
      </p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }} />
    </div>
  );
}
