import Link from "next/link";
import { authorName, authorUrl, getStore, sameAsUrls, siteDescription, siteName, siteUrl } from "../lib/site.ts";
import { serialiseJsonLd } from "../lib/scatterpost/safe-html.ts";
import { parseVersion, splitPosts } from "../lib/changelog.ts";

export default async function HomePage() {
  const { blogPosts, changelogPosts } = splitPosts(await getStore().list());
  const latestChangelog = changelogPosts.slice(0, 3);
  const latestBlog = blogPosts.slice(0, 3);
  const site = siteUrl();

  const sameAs = sameAsUrls();
  const author = authorUrl()
    ? { "@type": "Person", name: authorName(), url: authorUrl(), sameAs: sameAs.length > 0 ? sameAs : undefined }
    : { "@type": "Organization", name: authorName(), sameAs: sameAs.length > 0 ? sameAs : undefined };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: siteName(), url: site },
      author,
    ],
  };

  const hasAnyPosts = latestChangelog.length > 0 || latestBlog.length > 0;

  return (
    <div className="measure flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">{siteName()}</h1>
        <p className="text-[var(--muted-foreground)]">{siteDescription()}</p>
      </div>

      {!hasAnyPosts ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-medium">Nothing published yet</h2>
          <p className="mt-2">
            This site is ready to receive its first post. Connect it as a
            Website channel in scatterpost with your deployed URL and a
            webhook secret (<code>SCATTERPOST_WEBHOOK_SECRET</code>), or set
            up pull mode with <code>SCATTERPOST_API_URL</code> and{" "}
            <code>SCATTERPOST_API_KEY</code>. Tag a post &quot;changelog&quot;
            to have it show up here as a product update rather than an
            article. See this template&apos;s README for the exact steps.
          </p>
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">Latest updates</h2>
              <Link href="/changelog" className="tap-target text-sm underline">
                All updates
              </Link>
            </div>
            {latestChangelog.length === 0 ? (
              <p className="text-[var(--muted-foreground)]">No changelog entries yet.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {latestChangelog.map((post) => {
                  const version = parseVersion(post.title);
                  return (
                    <li key={post.slug} className="border-b border-[var(--border)] pb-4">
                      <Link href={`/changelog/${post.slug}`} className="text-lg font-medium underline">
                        {version ? <span className="mr-2 font-mono text-sm">{version}</span> : null}
                        {post.title}
                      </Link>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
                        </time>
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">Latest articles</h2>
              <Link href="/blog" className="tap-target text-sm underline">
                All articles
              </Link>
            </div>
            {latestBlog.length === 0 ? (
              <p className="text-[var(--muted-foreground)]">No articles yet.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {latestBlog.map((post) => (
                  <li key={post.slug} className="border-b border-[var(--border)] pb-4">
                    <Link href={`/blog/${post.slug}`} className="text-lg font-medium underline">
                      {post.title}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
                      </time>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }} />
    </div>
  );
}
