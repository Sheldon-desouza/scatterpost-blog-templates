import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { authorName, authorUrl, getStore, postUrl, siteName, siteUrl } from "../../../lib/site.ts";
import { renderMarkdown } from "../../../lib/scatterpost/render-markdown.ts";
import { isValidSlug, serialiseJsonLd } from "../../../lib/scatterpost/safe-html.ts";
import { isChangelogPost, splitPosts } from "../../../lib/changelog.ts";
import { CodeBlocks } from "../../../components/CodeBlocks.tsx";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) return {};
  const post = await getStore().get(slug);
  // A changelog-tagged post lives at /changelog/[slug], not here.
  if (!post || isChangelogPost(post)) return {};

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
  const { blogPosts } = splitPosts(await getStore().list());
  const index = blogPosts.findIndex((candidate) => candidate.slug === slug);
  const post = index === -1 ? await getStore().get(slug) : blogPosts[index];
  // A changelog-tagged post lives at /changelog/[slug], not here.
  if (!post || isChangelogPost(post)) {
    notFound();
  }
  // Newest first: the next item in the array is older (prev), the
  // previous item is newer (next).
  const previousPost = index > -1 ? blogPosts[index + 1] : undefined;
  const nextPost = index > 0 ? blogPosts[index - 1] : undefined;

  const canonical = post.canonical ?? postUrl(post.slug);
  const html = renderMarkdown(post.bodyMarkdown);
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

  return (
    <div className="measure flex flex-col gap-4">
      <article>
        <h1 className="entry-h1">{post.title}</h1>
        <p className="entry-byline">
          By{" "}
          {authorUrl() ? (
            <a href={authorUrl()} rel="author">
              {authorName()}
            </a>
          ) : (
            authorName()
          )}{" "}
          &middot; <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
        {post.cover ? (
          <p className="entry-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover} alt={post.coverAlt ?? post.title} width={1200} height={630} />
          </p>
        ) : null}
        <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: html }} />
        <CodeBlocks />

        {previousPost || nextPost ? (
          <nav className="post-footer-nav" aria-label="More articles">
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(breadcrumbJsonLd) }} />
    </div>
  );
}
