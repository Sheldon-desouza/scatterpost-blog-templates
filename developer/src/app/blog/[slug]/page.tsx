import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { authorName, authorUrl, getStore, postUrl, siteName, siteUrl } from "../../../lib/site.ts";
import { renderPostHtml } from "../../../lib/render-post-html.ts";
import { readingTimeMinutes } from "../../../lib/reading-time.ts";
import { isValidSlug, serialiseJsonLd } from "../../../lib/scatterpost/safe-html.ts";
import { postPath, postsAtRoot } from "../../../lib/scatterpost/post-paths.ts";
import { TableOfContents } from "../../../components/table-of-contents.tsx";
import { CodeCopyButtons } from "../../../components/code-copy-buttons.tsx";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) return {};
  const post = await getStore().get(slug);
  if (!post) return {};

  const canonical = post.canonical ?? postUrl(post.slug);
  // A cover wins; otherwise this post's own generated card. Next does
  // not add the opengraph-image file to metadata that sets openGraph
  // itself, so it is named here, absolute and built from siteUrl() so a
  // base path (NEXT_PUBLIC_SITE_URL=https://example.com/blog) is kept.
  const images = post.cover
    ? [{ url: post.cover, ...(post.coverAlt ? { alt: post.coverAlt } : {}) }]
    : [{ url: `${postUrl(post.slug)}/opengraph-image`, width: 1200, height: 630, alt: post.title }];
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
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images,
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

  const canonical = post.canonical ?? postUrl(post.slug);
  const { html, toc } = await renderPostHtml(post.bodyMarkdown);
  const minutes = readingTimeMinutes(post.bodyMarkdown);
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
    image: post.cover ? [post.cover] : [`${site}${postPath(post.slug)}/opengraph-image`],
    author,
    publisher: author,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    // With posts at the root, the listing is the home page itself, so
    // the "Blog" level is dropped rather than pointing at a redirect.
    itemListElement: postsAtRoot()
      ? [
          { "@type": "ListItem", position: 1, name: siteName(), item: site },
          { "@type": "ListItem", position: 2, name: post.title, item: canonical },
        ]
      : [
          { "@type": "ListItem", position: 1, name: siteName(), item: site },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${site}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: canonical },
        ],
  };

  return (
    <div className="post-layout">
      <article className="measure">
        <p className="post-kicker">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{minutes} min read</span>
          {post.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </p>
        <h1 className="post-h1">{post.title}</h1>
        <p className="post-byline">
          By{" "}
          {authorUrl() ? (
            <a href={authorUrl()} rel="author">
              {authorName()}
            </a>
          ) : (
            authorName()
          )}
        </p>
        {post.description ? <p className="post-dek">{post.description}</p> : null}
        {post.cover ? (
          <p className="post-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover} alt={post.coverAlt ?? post.title} width={1200} height={630} referrerPolicy="no-referrer" />
          </p>
        ) : null}
        <div className="prose mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

        {previousPost || nextPost ? (
          <nav className="post-footer-nav" aria-label="More posts">
            {previousPost ? (
              <Link href={postPath(previousPost.slug)} className="prev">
                <span className="label">Previous</span>
                <span className="title">{previousPost.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link href={postPath(nextPost.slug)} className="next">
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
      {toc.length > 0 ? (
        <aside className="toc-sidebar">
          <TableOfContents items={toc} />
        </aside>
      ) : null}
      <CodeCopyButtons />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(breadcrumbJsonLd) }} />
    </div>
  );
}
