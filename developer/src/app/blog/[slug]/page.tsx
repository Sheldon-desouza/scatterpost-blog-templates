import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { authorName, authorUrl, getStore, postUrl, siteName, siteUrl } from "../../../lib/site.ts";
import { renderPostHtml } from "../../../lib/render-post-html.ts";
import { readingTimeMinutes } from "../../../lib/reading-time.ts";
import { isValidSlug, serialiseJsonLd } from "../../../lib/scatterpost/safe-html.ts";
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
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  // `..`, `/`, `%2F` and anything else outside the slug shape never reach
  // the store (a FileStore or BlobStore would otherwise join it into a
  // file or object path).
  if (!isValidSlug(slug)) {
    notFound();
  }
  const post = await getStore().get(slug);
  if (!post) {
    notFound();
  }

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
    <div className="post-layout">
      <article className="measure flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">{post.title}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          By {authorUrl() ? (
            <a href={authorUrl()} rel="author" className="underline">
              {authorName()}
            </a>
          ) : (
            authorName()
          )}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
          </time>
          {" · "}
          {minutes} min read
        </p>
        <div className="prose mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
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
