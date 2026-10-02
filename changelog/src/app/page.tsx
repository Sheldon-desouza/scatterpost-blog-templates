import Link from "next/link";
import { authorName, authorUrl, getStore, sameAsUrls, siteDescription, siteName, siteUrl } from "../lib/site.ts";
import { serialiseJsonLd } from "../lib/scatterpost/safe-html.ts";
import { parseCategory, parseVersion, splitPosts } from "../lib/changelog.ts";

const CATEGORY_LABEL = { new: "New", improved: "Improved", fixed: "Fixed" } as const;

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

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
    "@graph": [{ "@type": "WebSite", name: siteName(), url: site }, author],
  };

  const hasAnyPosts = latestChangelog.length > 0 || latestBlog.length > 0;

  return (
    <div className="measure flex flex-col gap-10">
      <div className="page-header">
        <h1>{siteName()}</h1>
        <p className="page-description">{siteDescription()}</p>
        <p className="subscribe-row">
          <Link href="/feed.xml">RSS</Link>
        </p>
      </div>

      {!hasAnyPosts ? (
        <div className="empty-state">
          <h2>Nothing published yet</h2>
          <p>
            This site is ready to receive its first post. Connect it as a Website channel in scatterpost with your
            deployed URL and a webhook secret (<code>SCATTERPOST_WEBHOOK_SECRET</code>), or set up pull mode with{" "}
            <code>SCATTERPOST_API_URL</code> and <code>SCATTERPOST_API_KEY</code>. Tag a post &quot;changelog&quot;
            to have it show up here as a product update rather than an article. See this template&apos;s README for
            the exact steps.
          </p>
        </div>
      ) : (
        <>
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl">Latest updates</h2>
              <Link href="/changelog" className="tap-target muted-link">
                All updates
              </Link>
            </div>
            {latestChangelog.length === 0 ? (
              <p className="post-list-meta">No changelog entries yet.</p>
            ) : (
              <ul className="post-list">
                {latestChangelog.map((post) => {
                  const version = parseVersion(post.title);
                  const category = parseCategory(post.tags);
                  return (
                    <li key={post.slug} className="post-list-row">
                      <div className="entry-kicker">
                        <time dateTime={post.date} className="timeline-date">
                          {formatDate(post.date)}
                        </time>
                        {version ? <span className="version-badge">{version}</span> : null}
                        {category ? (
                          <span className={`category-pill category-pill-${category}`}>{CATEGORY_LABEL[category]}</span>
                        ) : null}
                      </div>
                      <Link href={`/changelog/${post.slug}`} className="post-list-title">
                        {post.title}
                      </Link>
                      {post.description ? <p className="post-list-summary">{post.description}</p> : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl">Latest articles</h2>
              <Link href="/blog" className="tap-target muted-link">
                All articles
              </Link>
            </div>
            {latestBlog.length === 0 ? (
              <p className="post-list-meta">No articles yet.</p>
            ) : (
              <ul className="post-list">
                {latestBlog.map((post) => (
                  <li key={post.slug} className="post-list-row">
                    <Link href={`/blog/${post.slug}`} className="post-list-title">
                      {post.title}
                    </Link>
                    <p className="post-list-meta">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </p>
                    {post.description ? <p className="post-list-summary">{post.description}</p> : null}
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
