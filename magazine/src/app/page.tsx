import Link from "next/link";
import { getStore } from "../lib/site.ts";
import { authorName, authorUrl, siteName, siteUrl } from "../lib/site.ts";
import { serialiseJsonLd } from "../lib/scatterpost/safe-html.ts";
import { Cover } from "../components/cover.tsx";
import { TagChips } from "../components/tag-chips.tsx";
import { PostCard } from "../components/post-card.tsx";

export default async function HomePage() {
  const posts = await getStore().list();
  const [featured, ...rest] = posts;
  const grid = rest.slice(0, 8);
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
    <div className="flex flex-col gap-10">
      <div className="measure flex flex-col gap-3">
        <h1 className="font-display text-3xl font-semibold">{siteName()}</h1>
        <p className="text-[var(--muted-foreground)]">
          A blog by {authorName()}, published with{" "}
          <a href="https://scatterpost.io" className="underline">
            scatterpost
          </a>
          : it publishes to this site first, then cross-posts elsewhere with a
          canonical link back here.
        </p>
      </div>

      {!featured ? (
        <div className="measure rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
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
        <>
          <article className="card featured">
            <Link href={`/blog/${featured.slug}`} className="block">
              <Cover title={featured.title} cover={featured.cover} priority />
            </Link>
            <div className="card-body">
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                <Link href={`/blog/${featured.slug}`} className="underline">
                  {featured.title}
                </Link>
              </h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                <time dateTime={featured.date}>
                  {new Date(featured.date).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </p>
              {featured.description ? <p>{featured.description}</p> : null}
              <TagChips tags={featured.tags} />
            </div>
          </article>

          {grid.length > 0 ? (
            <div className="card-grid">
              {grid.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : null}
        </>
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
