import Link from "next/link";
import { getStore } from "../lib/site.ts";
import { authorName, authorUrl, sameAsUrls, siteName, siteUrl } from "../lib/site.ts";
import { serialiseJsonLd } from "../lib/scatterpost/safe-html.ts";
import { readingTime } from "../lib/reading-time.ts";
import { BIO, SOCIAL_LINKS } from "../lib/config.ts";
import { PostIndex } from "../components/PostIndex.tsx";

export default async function HomePage() {
  const posts = await getStore().list();
  const [featured, ...rest] = posts;
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

  return (
    <div>
      <section className="home-hero">
        <h1>{authorName()}</h1>
        <p className="home-bio">{BIO}</p>
        {SOCIAL_LINKS.length > 0 ? (
          <nav className="home-links" aria-label="Elsewhere">
            {SOCIAL_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="tap-target">
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
      </section>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h2>No posts yet</h2>
          <p>
            This blog is ready to receive its first post. Connect it as a Website channel in
            scatterpost with your deployed URL and a webhook secret (
            <code>SCATTERPOST_WEBHOOK_SECRET</code>), or set up pull mode with{" "}
            <code>SCATTERPOST_API_URL</code> and <code>SCATTERPOST_API_KEY</code>. See this
            template&apos;s README for the exact steps.
          </p>
        </div>
      ) : (
        <>
          {featured ? (
            <Link
              href={`/blog/${featured.slug}`}
              className={`featured-post${featured.cover ? " featured-post-with-cover" : ""}`}
            >
              {featured.cover ? (
                <div className="featured-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.cover} alt={featured.coverAlt ?? featured.title} width={600} height={400} />
                </div>
              ) : null}
              <div className="featured-body">
                <p className="featured-kicker">
                  Latest &middot;{" "}
                  <time dateTime={featured.date}>
                    {new Date(featured.date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>{" "}
                  &middot; {readingTime(featured.bodyMarkdown)}
                </p>
                <h2>{featured.title}</h2>
                {featured.description ? <p>{featured.description}</p> : null}
              </div>
            </Link>
          ) : null}

          <section className="index-section">
            <h2>All writing</h2>
            <PostIndex posts={rest.length > 0 ? rest : posts} />
          </section>
        </>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }} />
    </div>
  );
}
