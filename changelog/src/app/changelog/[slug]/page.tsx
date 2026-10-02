import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { authorName, authorUrl, changelogUrl, getStore, siteName, siteUrl } from "../../../lib/site.ts";
import { renderMarkdown } from "../../../lib/scatterpost/render-markdown.ts";
import { isValidSlug, serialiseJsonLd } from "../../../lib/scatterpost/safe-html.ts";
import { isChangelogPost, parseCategory, parseVersion, splitPosts } from "../../../lib/changelog.ts";
import { CodeBlocks } from "../../../components/CodeBlocks.tsx";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_LABEL = { new: "New", improved: "Improved", fixed: "Fixed" } as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) return {};
  const post = await getStore().get(slug);
  // A post that is not tagged "changelog" lives at /blog/[slug], not here.
  if (!post || !isChangelogPost(post)) return {};

  const canonical = post.canonical ?? changelogUrl(post.slug);
  // A cover wins; otherwise this post's own generated card. Next does
  // not add the opengraph-image file to metadata that sets openGraph
  // itself, so it is named here, absolute and built from siteUrl() so a
  // base path (NEXT_PUBLIC_SITE_URL=https://example.com/blog) is kept.
  const images = post.cover
    ? [{ url: post.cover, ...(post.coverAlt ? { alt: post.coverAlt } : {}) }]
    : [{ url: `${changelogUrl(post.slug)}/opengraph-image`, width: 1200, height: 630, alt: post.title }];
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

export default async function ChangelogEntryPage({ params }: PageProps) {
  const { slug } = await params;
  // `..`, `/`, `%2F` and anything else outside the slug shape never reach
  // the store (a FileStore or BlobStore would otherwise join it into a
  // file or object path).
  if (!isValidSlug(slug)) {
    notFound();
  }
  const { changelogPosts } = splitPosts(await getStore().list());
  const index = changelogPosts.findIndex((candidate) => candidate.slug === slug);
  const post = index === -1 ? await getStore().get(slug) : changelogPosts[index];
  if (!post || !isChangelogPost(post)) {
    notFound();
  }
  // Newest first: the next item in the array is older (prev), the
  // previous item is newer (next).
  const previousEntry = index > -1 ? changelogPosts[index + 1] : undefined;
  const nextEntry = index > 0 ? changelogPosts[index - 1] : undefined;

  const canonical = post.canonical ?? changelogUrl(post.slug);
  const html = renderMarkdown(post.bodyMarkdown);
  const site = siteUrl();
  const version = parseVersion(post.title);
  const category = parseCategory(post.tags);

  const author = authorUrl()
    ? { "@type": "Person", name: authorName(), url: authorUrl() }
    : { "@type": "Organization", name: authorName() };

  // BlogPosting, not a bespoke type: a changelog entry is a dated,
  // authored piece of writing like any other post, and BlogPosting is
  // the type search engines and AI crawlers already recognise.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: canonical,
    mainEntityOfPage: canonical,
    image: post.cover ? [post.cover] : [`${site}/changelog/${post.slug}/opengraph-image`],
    author,
    publisher: author,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: siteName(), item: site },
      { "@type": "ListItem", position: 2, name: "Changelog", item: `${site}/changelog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <div className="measure flex flex-col gap-4">
      <article>
        <p className="entry-kicker">
          <time dateTime={post.date} className="timeline-date">
            {formatDate(post.date)}
          </time>
          {version ? <span className="version-badge">{version}</span> : null}
          {category ? (
            <span className={`category-pill category-pill-${category}`}>{CATEGORY_LABEL[category]}</span>
          ) : null}
        </p>
        <h1 className="entry-h1">{post.title}</h1>
        <p className="entry-byline">
          By{" "}
          {authorUrl() ? (
            <a href={authorUrl()} rel="author">
              {authorName()}
            </a>
          ) : (
            authorName()
          )}
        </p>
        {post.cover ? (
          <p className="entry-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover} alt={post.coverAlt ?? post.title} width={1200} height={630} referrerPolicy="no-referrer" />
          </p>
        ) : null}
        <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: html }} />
        <CodeBlocks />

        {previousEntry || nextEntry ? (
          <nav className="post-footer-nav" aria-label="More changelog entries">
            {previousEntry ? (
              <Link href={`/changelog/${previousEntry.slug}`} className="prev">
                <span className="label">Previous</span>
                <span className="title">{previousEntry.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {nextEntry ? (
              <Link href={`/changelog/${nextEntry.slug}`} className="next">
                <span className="label">Next</span>
                <span className="title">{nextEntry.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}

        <p className="subscribe-line">
          Subscribe over <Link href="/changelog/feed.xml">RSS</Link>.
        </p>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(breadcrumbJsonLd) }} />
    </div>
  );
}
