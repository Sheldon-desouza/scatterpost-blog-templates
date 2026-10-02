import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { authorName, authorUrl, getStore, postUrl, siteName, siteUrl } from "../../../lib/site.ts";
import { renderMarkdown } from "../../../lib/scatterpost/render-markdown.ts";
import { isValidSlug, serialiseJsonLd } from "../../../lib/scatterpost/safe-html.ts";
import { readingTime } from "../../../lib/reading-time.ts";
import { annotateHeadings } from "../../../lib/toc.ts";
import { kickerFor } from "../../../lib/kicker.ts";
import { Cover } from "../../../components/cover.tsx";
import { CodeBlocks } from "../../../components/CodeBlocks.tsx";
import { PostCard } from "../../../components/post-card.tsx";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) return {};
  const post = await getStore().get(slug);
  if (!post) return {};

  const canonical = post.canonical ?? postUrl(post.slug);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: post.cover ? [{ url: post.cover, ...(post.coverAlt ? { alt: post.coverAlt } : {}) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.cover ? [{ url: post.cover, ...(post.coverAlt ? { alt: post.coverAlt } : {}) }] : undefined,
    },
  };
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  // `..`, `/`, `%2F` and anything else outside the slug shape never reach
  // the store (a FileStore or BlobStore would otherwise join it into a
  // file or object path).
  if (!isValidSlug(slug)) {
    notFound();
  }
  const posts = await getStore().list();
  const index = posts.findIndex((candidate) => candidate.slug === slug);
  const post = index === -1 ? await getStore().get(slug) : posts[index];
  if (!post) {
    notFound();
  }
  // Newest first: the next item in the array is older (prev), the
  // previous item is newer (next).
  const previousPost = index > -1 ? posts[index + 1] : undefined;
  const nextPost = index > 0 ? posts[index - 1] : undefined;
  const moreStories = posts
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3);

  const canonical = post.canonical ?? postUrl(post.slug);
  const kicker = kickerFor(post);
  const rendered = renderMarkdown(post.bodyMarkdown);
  const { html, toc } = annotateHeadings(rendered);
  const site = siteUrl();

  const author = authorUrl()
    ? { "@type": "Person", name: authorName(), url: authorUrl() }
    : { "@type": "Organization", name: authorName() };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: canonical,
    mainEntityOfPage: canonical,
    image: post.cover ? [post.cover] : [`${site}/blog/${post.slug}/opengraph-image`],
    author,
    publisher: author,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: siteName(), item: site },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${site}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  const showToc = toc.length >= 3;

  return (
    <div className="post-layout">
      <article>
        <p className="kicker">{kicker}</p>
        <h1 className="post-h1">{post.title}</h1>
        {post.description ? <p className="post-dek">{post.description}</p> : null}
        <p className="post-byline">
          By{" "}
          {authorUrl() ? (
            <a href={authorUrl()} rel="author">
              {authorName()}
            </a>
          ) : (
            authorName()
          )}{" "}
          <span aria-hidden="true">&middot;</span> <time dateTime={post.date}>{formatDate(post.date)}</time>{" "}
          <span aria-hidden="true">&middot;</span> {readingTime(post.bodyMarkdown)}
        </p>

        <figure className="post-cover">
          <Cover title={post.title} cover={post.cover} coverAlt={post.coverAlt} priority />
          <figcaption>{post.title}</figcaption>
        </figure>

        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        <CodeBlocks />

        {moreStories.length > 0 ? (
          <section className="story-grid-section post-more-stories" aria-label="More stories">
            <h2 className="section-heading">More stories</h2>
            <div className="story-grid">
              {moreStories.map((candidate) => (
                <PostCard key={candidate.slug} post={candidate} />
              ))}
            </div>
          </section>
        ) : null}

        {previousPost || nextPost ? (
          <nav className="post-footer-nav" aria-label="More posts">
            {previousPost ? (
              <Link href={`/blog/${previousPost.slug}`} className="prev">
                <span className="label">Previous</span>
                <span className="title">{previousPost.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link href={`/blog/${nextPost.slug}`} className="next">
                <span className="label">Next</span>
                <span className="title">{nextPost.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}

        <p className="subscribe-line">
          Subscribe over <Link href="/feed.xml">RSS</Link>.
        </p>
      </article>

      {showToc ? (
        <aside className="toc" aria-label="Table of contents">
          <h2>On this page</h2>
          <ol>
            {toc.map((entry) => (
              <li key={entry.id}>
                <a href={`#${entry.id}`}>{entry.text}</a>
              </li>
            ))}
          </ol>
        </aside>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(breadcrumbJsonLd) }} />
    </div>
  );
}
